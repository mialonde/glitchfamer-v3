# GlitchFramer 2.0 Güvenlik Modeli (Security)

GlitchFramer uygulaması için güvenlik mimarisi, girdi doğrulaması ve dosya işleme politikaları.

---

## 1. Güvenlik Modeli (Security Model)

GlitchFramer, istemciden gelen tüm medya ve dosya isteklerini sunucu tarafında sıkı süzgeçlerden geçirerek çalışır.

### Temel Güvenlik İlkeleri:
1. **Zero-Trust Input Sanitization**: Kullanıcıdan gelen `uploadId`, `fileType` ve dosya isimleri alfabetik ve sayısal karakter dizilimi dışında temizlenir.
2. **Strict Limit Bounds**: Parçalı yükleme chunk boyutları maksimum `10 MB`, tekil dosya yükleme sınırları ise `200 MB` ile sınırlandırılmıştır.
3. **Isolating Temp Workspaces**: Yüklenen tüm geçici medya verileri `temp_renders` klasörü altında izole edilir ve web kök dizininden (public access) gizlenir.

---

## 2. Girdi Doğrulaması & Path Traversal Koruması (Input Validation)

Path Traversal (`../`) veya yetkisiz dizin erişimi saldırılarını önlemek amacıyla dosya yolları kesin regex süzgecinden geçirilir:

```typescript
const sanitizedId = (uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
if (!sanitizedId) {
  return res.status(400).json({ error: "Geçerli uploadId zorunludur." });
}
const sessionDir = path.join(UPLOADS_DIR, sanitizedId);
```

---

## 3. Dosya İşleme & Bellek Güvenliği (File Handling)

- **Disk Stream İzolasyonu**: Sunucu bellek şişmesini (Heap exhaustion) engellemek için `multer.diskStorage` veya senkron parçalı dosya birleştirme (`fs.appendFileSync`) kullanılır.
- **Otomatik Zamanlı Temizlik**: İşlemi tamamlanan veya 1 saatten eski kalan render işleri ve dosyaları otomatik olarak sistemden silinir:
  ```typescript
  setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
      if (now - job.createdAt > 60 * 60 * 1000) {
        if (job.outputPath && fs.existsSync(job.outputPath)) {
          try { fs.unlinkSync(job.outputPath); } catch (_) {}
        }
        jobs.delete(id);
      }
    }
  }, 10 * 60 * 1000);
  ```

---

## 4. Yapay Zeka API Güvenliği (Gemini API Key Handling)

- `GEMINI_API_KEY` çevre değişkeni (`.env`) üzerinden okunur. İstemci tarafına (browser bundle) asla sızdırılmaz. Tüm yapay zeka şarkı sözü analizleri sunucu tarafındaki `/api/sync-lyrics` endpoint'i üzerinden güvenli bir şekilde yürütülür.
