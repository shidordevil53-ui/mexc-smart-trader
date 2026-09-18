# MEXC Smart Trader V1 — Android via PWA

Ini adalah prototype antarmuka yang dapat dibuka dari HP Android. V1 belum mengirim order ke MEXC dan belum meminta API key.

## Cara menjalankan dari HP saja

Pilihan termudah:
1. Simpan/unggah folder proyek ini ke layanan hosting statis yang Anda gunakan.
2. Buka alamat web hasil hosting di Chrome Android.
3. Pilih "Tambahkan ke layar utama" / "Install app" jika Chrome menawarkannya.
4. Aplikasi akan tampil seperti aplikasi Android.

## Tahap berikutnya
- Hubungkan backend ke market-data MEXC.
- Tambahkan perhitungan EMA, RSI, MACD, ATR dan volume.
- Tambahkan detector drop/base/breakout/retest.
- Tambahkan backtest.
- Tambahkan paper trading.
- Baru kemudian integrasi trading API.

## Keamanan wajib
- API key tidak boleh dimasukkan ke HTML/JavaScript.
- Secret key tidak boleh dimasukkan ke GitHub atau APK.
- Untuk integrasi live, API key harus tanpa permission withdrawal.
- Withdrawal tetap manual di MEXC.
