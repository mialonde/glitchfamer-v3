import { Router } from "express";
import { isUrlSafe, fetchWithTimeout } from "../utils/security";

const router = Router();

// 1. Suno Şarkı Bilgisi & Metadata Analizi (Multi-Source Fetcher & Aligned Lyrics Extractor)
router.post("/suno/inspect", async (req, res) => {
  try {
    const { url, trackId: reqTrackId, rawJson } = req.body;
    
    // Eğer kullanıcı doğrudan ham Suno API JSON'ı iletmişse
    if (rawJson && typeof rawJson === "object") {
      const clip = Array.isArray(rawJson) ? rawJson[0] : (rawJson.clips ? rawJson.clips[0] : rawJson);
      return res.json(clip);
    }

    const input = (url || reqTrackId || "").toString().trim();
    
    let trackId: string | null = reqTrackId || null;
    let scrapedMetadata: any = null;

    // Adım A: Doğrudan UUID veya bilinen URL kalıplarından Track ID ayıkla
    if (!trackId && input) {
      const uuidMatch = input.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
      if (uuidMatch) {
        trackId = uuidMatch[1].toLowerCase();
      } else {
        const songMatch = input.match(/(?:song|clip|track)\/([a-zA-Z0-9_-]+)/i);
        if (songMatch) {
          trackId = songMatch[1];
        } else {
          const cdnMatch = input.match(/(?:cdn\d*|audiocdn\d*)\.suno\.(?:ai|com)\/([a-zA-Z0-9_-]+)\.mp3/i);
          if (cdnMatch) {
            trackId = cdnMatch[1];
          }
        }
      }
    }

    // Adım B: Eğer /s/ short linki veya henüz UUID çıkarılamamış bir Suno web URL'i girilmişse
    if ((!trackId || input.includes('/s/')) && /^https?:\/\//i.test(input)) {
      if (!isUrlSafe(input)) {
        return res.status(400).json({ error: "Güvensiz veya geçersiz Suno URL'i." });
      }
      try {
        const pageRes = await fetchWithTimeout(input, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          redirect: "follow"
        }, 8000);

        const finalUrl = pageRes.url || input;
        const finalUuidMatch = finalUrl.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        if (finalUuidMatch) {
          trackId = finalUuidMatch[1].toLowerCase();
        }

        if (pageRes.ok) {
          const html = await pageRes.text();

          // HTML içinden UUID ara
          if (!trackId) {
            const htmlUuid = html.match(/(?:cdn\d*\.suno\.ai\/|clip\/|song\/|"id":\s*")([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
            if (htmlUuid) {
              trackId = htmlUuid[1].toLowerCase();
            }
          }

          // HTML Meta etiketlerini ayıkla
          const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1];
          const ogAudio = html.match(/<meta[^>]*property=["']og:audio["'][^>]*content=["']([^"']*)["']/i)?.[1];
          const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)?.[1];
          const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1];

          scrapedMetadata = {
            title: ogTitle,
            audio_url: ogAudio,
            image_url: ogImage,
            description: ogDesc
          };
        }
      } catch (scrapeErr) {
        console.warn("Suno link scraping warning:", scrapeErr);
      }
    }

    if (!trackId && !scrapedMetadata?.audio_url) {
      return res.status(400).json({ error: "Geçerli bir Suno Track ID veya URL bulunamadı." });
    }

    // Adım C: Suno Studio Public API üzerinden parça verisini sorgula
    let clipData: any = null;
    if (trackId) {
      const studioEndpoints = [
        `https://studio-api.prod.suno.com/api/clip/${trackId}`,
        `https://studio-api.prod.suno.com/api/feed/v2?ids=${trackId}`,
        `https://studio-api.suno.ai/api/feed/v2?ids=${trackId}`
      ];

      for (const endpoint of studioEndpoints) {
        try {
          const apiRes = await fetchWithTimeout(endpoint, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              "Accept": "application/json"
            }
          }, 8000);

          if (apiRes.ok) {
            const json = await apiRes.json();
            if (Array.isArray(json) && json.length > 0) {
              clipData = json[0];
              break;
            } else if (json && json.clips && Array.isArray(json.clips) && json.clips.length > 0) {
              clipData = json.clips[0];
              break;
            } else if (json && (json.id || json.audio_url || json.title)) {
              clipData = json;
              break;
            }
          }
        } catch (apiErr) {
          console.warn(`Suno API endpoint fetch warning (${endpoint}):`, apiErr);
        }
      }

      // Adım C.2: Suno Aligned Lyrics Endpoint Sorgulaması (xiliourt / Lumi-Script pattern)
      if (clipData && (!clipData.metadata?.alignment && !clipData.aligned_lyrics)) {
        const alignedEndpoints = [
          `https://studio-api.prod.suno.com/api/clip/${trackId}/aligned_lyrics/`,
          `https://studio-api.prod.suno.com/api/aligned_lyrics/${trackId}`
        ];

        for (const aEndpoint of alignedEndpoints) {
          try {
            const aRes = await fetchWithTimeout(aEndpoint, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
              }
            }, 8000);
            if (aRes.ok) {
              const aJson = await aRes.json();
              if (Array.isArray(aJson) && aJson.length > 0) {
                clipData.aligned_lyrics = aJson;
                if (!clipData.metadata) clipData.metadata = {};
                clipData.metadata.alignment = aJson;
                break;
              } else if (aJson?.aligned_words || aJson?.words || aJson?.alignment) {
                const wordsArr = aJson.aligned_words || aJson.words || aJson.alignment;
                clipData.aligned_lyrics = wordsArr;
                if (!clipData.metadata) clipData.metadata = {};
                clipData.metadata.alignment = wordsArr;
                break;
              }
            }
          } catch (aErr) {
            // Sessiz geç
          }
        }
      }
    }

    // Adım D: Fallback ve Scraped veri birleştirme
    if (!clipData) {
      const resolvedId = trackId || "suno-track";
      clipData = {
        id: resolvedId,
        title: scrapedMetadata?.title || "Demo Song",
        display_name: "Demo Singer",
        audio_url: scrapedMetadata?.audio_url || `https://cdn1.suno.ai/${resolvedId}.mp3`,
        image_large_url: scrapedMetadata?.image_url || `https://cdn1.suno.ai/image_${resolvedId}.png`,
        image_url: scrapedMetadata?.image_url || `https://cdn1.suno.ai/image_${resolvedId}.png`,
        prompt: scrapedMetadata?.description || "",
        metadata: {
          duration: 180,
          tags: "AI Music",
          prompt: scrapedMetadata?.description || ""
        }
      };
    }

    res.json(clipData);
  } catch (error: any) {
    console.error("Suno inspect error:", error);
    res.status(500).json({ error: error?.message || "Suno şarkı bilgisi alınamadı." });
  }
});

// 2. Suno Audio Stream Proxy (CORS & Web Audio Analyser Desteği)
router.get("/suno/proxy-audio", async (req, res) => {
  try {
    const audioUrlParam = req.query.url as string;
    const trackId = req.query.id as string;

    let targetUrl = audioUrlParam;
    if (!targetUrl && trackId) {
      targetUrl = `https://cdn1.suno.ai/${trackId}.mp3`;
    }

    if (!targetUrl || !isUrlSafe(targetUrl)) {
      return res.status(400).send("Geçerli ve güvenli bir audio url gereklidir.");
    }

    // Suno CDN'den audio stream çek (15s timeout)
    const audioRes = await fetchWithTimeout(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Range": req.headers.range || "bytes=0-"
      }
    }, 15000);

    if (!audioRes.ok && audioRes.status !== 206) {
      return res.status(audioRes.status).send(`Suno Audio CDN hatası: ${audioRes.statusText}`);
    }

    // Response headers (CORS ve Web Audio için tam yetki)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Origin, Content-Type, Accept");
    res.setHeader("Content-Type", audioRes.headers.get("content-type") || "audio/mpeg");
    
    const contentLength = audioRes.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    
    const contentRange = audioRes.headers.get("content-range");
    if (contentRange) {
      res.status(206);
      res.setHeader("Content-Range", contentRange);
    }
    res.setHeader("Accept-Ranges", "bytes");

    if (audioRes.body) {
      const { Readable } = await import("stream");
      const nodeStream = Readable.fromWeb(audioRes.body as any);
      nodeStream.pipe(res);
    } else {
      const arrayBuf = await audioRes.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    }
  } catch (error: any) {
    console.error("Suno proxy audio error:", error);
    res.status(500).send("Audio proxy hatası");
  }
});

// 3. Suno Aligned Lyrics Doğrudan Sorgu Endpoint'i (xiliourt/Suno-Lyrics & Lumi-Script)
router.get("/suno/aligned-lyrics/:trackId", async (req, res) => {
  try {
    const trackId = req.params.trackId;
    if (!trackId || !/^[0-9a-zA-Z_-]+$/.test(trackId)) {
      return res.status(400).json({ error: "Geçersiz trackId" });
    }

    const alignedEndpoints = [
      `https://studio-api.prod.suno.com/api/clip/${trackId}/aligned_lyrics/`,
      `https://studio-api.prod.suno.com/api/aligned_lyrics/${trackId}`,
      `https://studio-api.prod.suno.com/api/feed/v2?ids=${trackId}`
    ];

    for (const ep of alignedEndpoints) {
      try {
        const epRes = await fetchWithTimeout(ep, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
          }
        }, 8000);
        if (epRes.ok) {
          const data = await epRes.json();
          if (Array.isArray(data) && data.length > 0) {
            return res.json({ trackId, words: data });
          } else if (data && (data.aligned_words || data.words || data.alignment)) {
            return res.json({ trackId, words: data.aligned_words || data.words || data.alignment });
          } else if (Array.isArray(data) && data[0]?.metadata?.alignment) {
            return res.json({ trackId, words: data[0].metadata.alignment });
          }
        }
      } catch (err) {
        // Devam et
      }
    }

    res.status(404).json({ error: "Bu şarkı için henüz hizalanmış söz (alignment) verisi bulunamadı." });
  } catch (err: any) {
    console.error("Aligned lyrics error:", err);
    res.status(500).json({ error: "Söz hizalama verisi alınamadı." });
  }
});

export default router;
