# Link Kaget — First Claim Wins

Website "Dana Kaget tapi Link": satu link dapat diklaim satu kali, dan klaim pertama menjadi pemenang.

## Cara menjalankan lokal
Butuh Node.js 18+.

```bash
npm install
npm start
```

Buka http://localhost:3000

## Cara deploy
Versi ini menggunakan Node.js + Express + SQLite. Cocok untuk VPS/hosting Node.js yang menyediakan persistent disk.

1. Upload seluruh folder.
2. Jalankan `npm install`.
3. Jalankan `npm start`.
4. Pastikan `PORT` disediakan oleh hosting.
5. Database `data/link-kaget.db` akan dibuat otomatis.

## Cara pakai
1. Buka halaman utama.
2. Masukkan link hadiah, misalnya `https://example.com/hadiah`.
3. Klik "Buat Link Kaget".
4. Salin link yang dibuat dan bagikan.
5. Orang pertama yang menekan "KLAIM SEKARANG" akan mendapatkan link hadiah.
6. Setelah itu semua orang lain melihat bahwa hadiah sudah diklaim.

Catatan:
- "Pertama" ditentukan oleh request yang berhasil diproses server/database.
- Jangan memasukkan password, token rahasia, atau URL yang tidak boleh diketahui oleh server.
- Untuk produksi publik, gunakan HTTPS dan hosting dengan SQLite/persistent storage atau ganti database dengan Postgres.
