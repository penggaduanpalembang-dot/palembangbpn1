# Dashboard Pengaduan Pelayanan Kantor Pertanahan Kota Palembang

Aplikasi Web Dashboard Pengaduan Pelayanan Publik untuk Kantor Pertanahan (BPN) Kota Palembang. Aplikasi ini memfasilitasi pelaporan, pemantauan, verifikasi, dan tindak lanjut pengaduan masyarakat secara transparan dan efisien.

---

## 🌟 Fitur Utama

- **Simulasi Peran Multi-User**:
  - **Masyarakat**: Mengajukan pengaduan pelayanan, mengunggah bukti/berkas pendukung, dan memantau status secara *real-time*.
  - **Manager Loket**: Memverifikasi pengaduan masuk, meninjau dokumen, dan meneruskan berkas ke petugas terkait.
  - **Petugas**: Memproses tindak lanjut pengaduan, memberikan catatan progres, dan memperbarui status penyelesaian.
  - **Administrator**: Mengelola master data petugas, melihat spreadsheet database lengkap, dan mengekspor/mengimpor log aktivitas.
- **Dashboard Analitik**:
  - Statistik ringkasan pengaduan (Total, Menunggu Verifikasi, Dalam Diproses, Selesai, Ditolak).
  - Grafik tren pengaduan bulanan & distribusi kategori pelayanan.
- **Tampilan Spreadsheet & Database**:
  - Filter interaktif, pencarian kata kunci, serta opsi unduh data.
- **Pusat Notifikasi & Log Aktivitas**:
  - Notifikasi real-time untuk perubahan status dan riwayat tindakan pengguna.

---

## 🛠️ Teknologi & Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Animation**: Motion (Framer Motion)
- **Build Tool**: Vite

---

## 🚀 Cara Menjalankan secara Lokal

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/USERNAME/pengaduan-bpn-palembang.git
   cd pengaduan-bpn-palembang
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembang**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 📂 Struktur Proyek

```
.
├── src/
│   ├── components/       # Komponen UI (Form, Spreadsheet, Charts, Action Panels)
│   ├── App.tsx           # Entry point utama aplikasi & manajemen state
│   ├── mockData.ts       # Mock data & handler persistent LocalStorage
│   ├── types.ts          # Definisi antarmuka & tipe TypeScript
│   └── main.tsx          # Main mounting React
├── index.html
├── package.json
└── vite.config.ts
```

---

## 📄 Lisensi

Proyek ini dibuat untuk tujuan simulasi dan demonstrasi pelayanan publik BPN Kota Palembang.
