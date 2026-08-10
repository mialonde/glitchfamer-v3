export async function fetchLyrics(title: string, artist: string): Promise<string> {
  if (!title || !artist) return "Sözler bulunamadı.";

  try {
    // İleride buraya kendi API'mizi (örneğin /api/get-lyrics) bağlayabiliriz.
    // Şimdilik uygulamanın çökmemesi için sahte (placeholder) dönüş yapıyoruz.
    return "Lirik senkronizasyonu backend üzerinden yapılmaktadır...";
  } catch (error) {
    console.error("Lyrics Fetch Error:", error);
    return "Sözler çekilirken hata oluştu.";
  }
}
