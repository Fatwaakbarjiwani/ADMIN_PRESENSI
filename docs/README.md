# Admin Presensi

Aplikasi web admin untuk mengelola sistem presensi pegawai—dashboard, data pegawai, shift, lokasi, event, dinas, izin, dan laporan rekap presensi. Frontend dibangun dengan **React 18**, **Vite 6**, **Redux Toolkit**, dan **Tailwind CSS 4**, terhubung ke API backend melalui variabel lingkungan `VITE_API_URL`.

## Daftar isi

- [Fitur utama](#fitur-utama)
- [Persyaratan](#persyaratan)
- [Instalasi & menjalankan](#instalasi--menjalankan)
- [Konfigurasi lingkungan](#konfigurasi-lingkungan)
- [Peran pengguna (role)](#peran-pengguna-role)
- [Struktur proyek](#struktur-proyek)
- [Routing](#routing)
- [State management](#state-management)
- [Skrip npm](#skrip-npm)
- [Dokumentasi lanjutan](#dokumentasi-lanjutan)

## Fitur utama

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | Statistik presensi, grafik, filter bulan/tahun dan unit |
| **Data pegawai** | Manajemen pegawai per unit; manajemen admin (super admin) |
| **Atur lokasi** | Unit dan detail lokasi presensi (peta: Leaflet / OpenLayers) |
| **Shift** | CRUD shift, detail shift, penugasan karyawan ke shift |
| **Event** | Event presensi khusus, peserta, rekap & history |
| **Daftar libur** | Hari libur nasional/unit (admin unit) |
| **Dinas** | Pengajuan dan data perjalanan dinas |
| **Rekap izin** | Pengaturan jenis izin (super admin) & rekap pengajuan |
| **Rekap presensi** | Rekap bulanan, history, lembur, lauk pauk, export PDF |
| **Monitoring** | Role khusus: history & rekap per unit yang di-assign |
| **Import CSV** | Impor data (route tersedia, menu sidebar saat ini dinonaktifkan) |

## Persyaratan

- **Node.js** 18+ (disarankan LTS)
- **npm** atau **pnpm**
- Backend API presensi yang sudah berjalan (Laravel atau sejenisnya—endpoint di bawah `/api/...`)

## Instalasi & menjalankan

```bash
# Clone & masuk ke folder proyek
cd ADMIN_PRESENSI

# Pasang dependensi
npm install

# Salin contoh env dan sesuaikan URL API
cp .env.example .env

# Mode development (http://localhost:5173)
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## Konfigurasi lingkungan

Buat file `.env` di root proyek (tidak di-commit ke Git):

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `VITE_API_URL` | Ya | Base URL backend, contoh: `http://localhost:8000` |
| `VITE_MODE` | Tidak | Jika `production`, Redux DevTools dinonaktifkan |

Contoh:

```env
VITE_API_URL=http://localhost:8000
VITE_MODE=development
```

Semua request API memakai pola:

```
${VITE_API_URL}/api/...
```

Header autentikasi: `Authorization: Bearer <token>` (token disimpan di `localStorage`).

## Peran pengguna (role)

Menu dan akses halaman bergantung pada role dari endpoint `GET /api/admin/me`:

| Role | Akses ringkas |
|------|----------------|
| **super_admin** | Semua unit; manajemen admin; setting izin; tanpa menu Daftar Libur |
| **admin_unit** | Unit sendiri; pegawai, shift, event, dinas, rekap, daftar libur |
| **monitoring** | Hanya dashboard + modul Monitoring Presensi (tab history, rekap, lembur, lauk pauk) |

Komponen `Protected` mengarahkan pengguna tanpa token ke `/login`. Halaman login mengarahkan pengguna yang sudah login ke `/`.

## Struktur proyek

```
ADMIN_PRESENSI/
├── public/                 # Aset statis
├── src/
│   ├── components/         # Layout, Sidebar, Protected
│   ├── pages/              # Halaman per fitur
│   │   ├── data_pegawai/   # Pegawai, Manajemen Admin
│   │   └── presensi/       # Modul presensi & monitoring/
│   ├── redux/
│   │   ├── actions/        # Thunk/API calls (axios)
│   │   ├── reducers/       # Redux slices
│   │   └── store.js
│   ├── App.jsx             # Definisi routing
│   └── main.jsx            # Entry + Redux Provider
├── docs/                   # Dokumentasi tambahan
├── .env.example
├── vite.config.js
└── package.json
```

Detail arsitektur, pola Redux, dan daftar endpoint: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Routing

Ringkasan path utama (semua kecuali `/login` dibungkus `Protected` + `MainLayout`):

| Path | Halaman |
|------|---------|
| `/login` | Login |
| `/` | Dashboard (Home) |
| `/management_pegawai` | Data pegawai |
| `/menejemen_admin` | Manajemen admin (super admin) |
| `/lokasi` | Atur lokasi |
| `/atur_shift`, `/shift-detail/:id` | Shift |
| `/shift_dosen_karyawan` | Shift karyawan |
| `/event`, `/event/tambah`, `/event/:id`, `/event/:id/edit`, `/event/:id/pegawai` | Event |
| `/daftar_libur` | Hari libur |
| `/rekap_izin` | Data / setting izin |
| `/dinas`, `/dinas/tambah` | Dinas |
| `/rekap_presensi` | Rekap presensi bulanan |
| `/monitoring_presensi/*` | Monitoring (nested routes) |
| `/import_csv` | Import CSV |
| `/presensi/rekap-bulanan-pegawai/:pegawai_id` | Detail rekap pegawai |
| `/presensi/detail-history-presensi/:pegawai_id/:unit_id` | Detail history |
| `/presensi/laporan-kehadiran/:pegawai_id` | Laporan kehadiran |

## State management

- **Redux Toolkit** (`configureStore`) dengan reducer gabungan: `auth`, `shift`, `presensi`, `pegawai`, `unit`, `unitDetail`, `izin`, `admin`, `hariLibur`, `laukPauk`, `dashboard`, dll.
- **Auth**: token di `localStorage`; action `login`, `logout`, `getMe`.
- **API**: mayoritas di `src/redux/actions/*`; sebagian halaman memanggil `axios` langsung.

## Skrip npm

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development server (Vite HMR) |
| `npm run build` | Build ke folder `dist/` |
| `npm run preview` | Serve build lokal |
| `npm run lint` | ESLint |

## Dokumentasi lanjutan

| Dokumen | Isi |
|---------|-----|
| [Arsitektur](docs/ARCHITECTURE.md) | Pola kode, Redux, diagram alur |
| [API per halaman](docs/API_PER_HALAMAN.md) | Endpoint backend per route/halaman |
| [User manual admin](docs/USER_MANUAL_ADMIN.md) | Panduan penggunaan untuk Admin Unit, Super Admin, Monitoring |
| [Panduan pengembang](docs/DEVELOPMENT.md) | Setup dev, konvensi, troubleshooting |

## Teknologi

React, React Router v7, Redux Toolkit, Axios, Tailwind CSS 4, Vite, Leaflet / react-leaflet, OpenLayers, Recharts, jsPDF, SweetAlert2, react-select, react-multi-date-picker.

## Lisensi

Proyek private (`"private": true` di `package.json`). Sesuaikan lisensi dengan kebijakan organisasi Anda.
