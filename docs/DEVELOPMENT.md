# Panduan Pengembangan

Panduan singkat untuk developer yang menambah fitur atau memperbaiki bug di Admin Presensi.

## Setup lokal

1. Pastikan backend API berjalan dan CORS mengizinkan origin Vite (`http://localhost:5173`).
2. Salin `.env.example` → `.env`, isi `VITE_API_URL`.
3. `npm install` lalu `npm run dev`.
4. Login dengan akun admin dari backend.

## Konvensi kode

- **Bahasa UI**: Indonesia (label, pesan error, SweetAlert).
- **Komponen**: functional components + hooks.
- **State global**: Redux actions/reducers untuk data yang dipakai lintas halaman; state lokal `useState` untuk form/UI.
- **HTTP**: prefer tambah method di `src/redux/actions/` daripada axios tersebar—kecuali pola halaman existing memang inline (mis. `DataIzin.jsx`).
- **Routing**: daftarkan route baru di `App.jsx` dengan pola `Protected` + `MainLayout`.
- **Menu**: tambah item di `Sidebar.jsx` dan pertimbangkan filter `isSuperAdmin` / `isMonitoring`.

## Menambah halaman baru

1. Buat komponen di `src/pages/...`.
2. Import dan tambah `<Route>` di `App.jsx`.
3. Tambah link di `Sidebar.jsx` (dengan rules role jika perlu).
4. Buat `*Action.js` + `*Reducer.js` jika perlu state global; daftarkan di `reducers/index.js`.
5. Uji login, akses tanpa token (harus redirect), dan role yang relevan.

## Autentikasi di request API

Ambil token dari Redux di thunk:

```javascript
export const contohFetch = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/contoh`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  // ...
};
```

## Role-based UI

```javascript
const { user } = useSelector((state) => state.auth);
const isSuperAdmin = user?.role === "super_admin";
const isMonitoring = user?.role === "monitoring";
```

Contoh implementasi: `Sidebar.jsx`, `Home.jsx`.

## Peta (lokasi presensi)

Modul `AturLokasi.jsx` menggabungkan peta interaktif dengan API `unit-detail`. Saat mengubah:

- Perhatikan koordinat (lat/lng) dan format geo yang diharapkan backend.
- Library: Leaflet Draw / OpenLayers—jangan campur API tanpa kebutuhan.

## Export PDF

Beberapa halaman rekap memakai `jspdf` dan `jspdf-autotable`. Ikuti pola import dan generate table yang sudah ada di komponen rekap terkait.

## Linting

```bash
npm run lint
```

Konfigurasi: `eslint.config.js` (flat config ESLint 9 + plugin React).

## Troubleshooting

| Masalah | Kemungkinan penyebab |
|---------|----------------------|
| Blank setelah refresh | Token invalid; backend menolak `/api/admin/me` |
| CORS error | Backend tidak mengizinkan origin dev |
| `undefined/api/...` | `VITE_API_URL` tidak ter-set; restart `npm run dev` setelah ubah `.env` |
| Menu tidak muncul | Role user tidak sesuai kondisi di `Sidebar.jsx` |
| 401 pada semua request | Token expired; logout dan login ulang |

## Environment di production

- Set `VITE_*` **sebelum** `npm run build` (nilai di-bundle saat build).
- Jangan commit file `.env` (sudah di `.gitignore`).
- Gunakan `VITE_MODE=production` untuk menonaktifkan Redux DevTools.

## File yang sebaiknya tidak diubah tanpa kebutuhan

- `src/pages/copy.jsx`, `* copy.jsx` — salinan lama
- Typo route `/menejemen_admin` — ubah hanya jika sekaligus memperbarui semua referensi dan bookmark

## Referensi cepat perintah

```bash
npm run dev      # development
npm run build    # production build
npm run preview  # test build lokal
npm run lint     # static analysis
```
