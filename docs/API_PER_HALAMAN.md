# Dokumentasi API per Halaman

Dokumen ini memetakan **endpoint backend** yang dipanggil dari setiap halaman frontend Admin Presensi.

## Konvensi umum

| Item | Nilai |
|------|--------|
| Base URL | `{VITE_API_URL}` dari file `.env` |
| Prefix | Semua path di bawah `/api/...` |
| Autentikasi | Header `Authorization: Bearer {token}` (kecuali login) |
| Sumber kode | `src/pages/...` dan `src/redux/actions/...` |

> **Catatan:** Spesifikasi request/response lengkap (validasi, tipe field) ada di dokumentasi backend. Tabel ini mencerminkan **pemakaian aktual di frontend**.

---

## Autentikasi (global)

Digunakan di `Login.jsx`, `Sidebar.jsx`, `Protected.jsx`.

| Method | Endpoint | Halaman / komponen | Body / query |
|--------|----------|-------------------|--------------|
| POST | `/api/admin/login` | Login | `{ email, password }` |
| GET | `/api/admin/me` | Sidebar (setiap load) | — |

---

## `/login` — Login

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/admin/login` | Mengembalikan `token`; disimpan di `localStorage` |

**Action:** `authAction.login`

---

## `/` — Dashboard (Home)

| Method | Endpoint | Query | Role |
|--------|----------|-------|------|
| GET | `/api/dashboard` | `bulan`, `tahun`, `unit_id` (opsional) | Semua admin; monitoring wajib pilih unit |
| GET | `/api/admin/monitoring/get-unit` | — | Role `monitoring` saja |

**Actions:** `dashboardAction.fetchDashboard`, `adminMonitoringAction.fetchMonitoringUnits`

---

## `/management_pegawai` — Pegawai

| Method | Endpoint | Query | Role |
|--------|----------|-------|------|
| GET | `/api/pegawai` | `page`, `search` | `super_admin` |
| GET | `/api/pegawai/by-unit-id-presensi` | `page`, `search` | `admin_unit` |

**Action:** `pegawaiAction.fetchPegawai`

**Navigasi terkait:** tombol *Setting Lokasi Pegawai* → `/tambah-karyawan-ke-unit-detail`

---

## `/tambah-karyawan-ke-unit-detail` — Setting Lokasi Pegawai

| Method | Endpoint | Body / query |
|--------|----------|--------------|
| GET | `/api/pegawai` | `page`, `search` |
| GET | `/api/unit/with-location` | Daftar unit detail + lokasi |
| POST | `/api/unit-detail/add-pegawai-to-unit-detail` | `{ unit_detail_id, pegawai_ids[] }` |

**Actions:** `pegawaiAction.fetchTambahPegawaiList`, `pegawaiAction.addPegawaiToUnitDetail`, `unitDetailAction.fetchUnitDetails`

---

## `/menejemen_admin` — Manajemen Admin

Hanya role **`super_admin`**.

### Tab Admin Unit

| Method | Endpoint | Body (ringkas) |
|--------|----------|----------------|
| GET | `/api/admin` | — |
| GET | `/api/unit` | Daftar unit (dropdown) |
| POST | `/api/admin/create` | `name`, `email`, `password`, `role`, `unit_id`, `status` |
| PUT | `/api/admin/update/:id` | Sama seperti create |
| DELETE | `/api/admin/delete/:id` | — |

**Actions:** `adminAction.*`, `unitDetailAction.fetchAllUnit`

### Tab Admin Monitoring

| Method | Endpoint | Body (ringkas) |
|--------|----------|----------------|
| GET | `/api/admin/monitoring/get-all` | — |
| POST | `/api/admin/monitoring/create` | `name`, `email`, `password`, `status`, `unit_ids[]` |
| PUT | `/api/admin/monitoring/update/:id` | Sama seperti create |
| DELETE | `/api/admin/delete/:id` | Hapus akun monitoring |

**Actions:** `adminMonitoringAction.*`

---

## `/lokasi` — Atur Lokasi

| Method | Endpoint | Body / query |
|--------|----------|--------------|
| GET | `/api/unit/with-location` | Daftar unit + polygon lokasi |
| GET | `/api/unit-detail/get-by-unit-id/:id` | Koordinat saat edit peta |
| PUT | `/api/unit-detail/update-location/:id` | `{ lokasi, lokasi2, lokasi3 }` (array koordinat polygon) |

**Actions:** `unitDetailAction.fetchUnitDetails` + axios langsung di halaman

> Create/delete unit detail di action tersedia (`unitDetailAction`) tetapi **tidak aktif** di UI halaman ini saat ini.

---

## `/atur_shift` — Shift

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/shift` | — |
| GET | `/api/unit` | Super admin: pilih unit saat buat shift |
| POST | `/api/shift/create` | `{ name }` atau `{ name, unit_id }` |
| PUT | `/api/shift/update/:id` | `{ name }` |
| DELETE | `/api/shift/delete/:id` | — |

**Actions:** `shiftAction.fetchShifts`, `createShift`, `updateShift`, `deleteShift`, `unitDetailAction.fetchAllUnit`

---

## `/shift-detail/:id` — Detail Shift

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/shift` | Ambil semua shift + detail |
| POST | `/api/shift-detail/create` | Jadwal detail (jam masuk/pulang, hari, dll.) |
| PUT | `/api/shift-detail/update/:detailId` | Update detail |

**Actions:** `shiftAction.fetchShifts`, `createShiftDetail`, `updateShiftDetail`

---

## `/tambah-karyawan-ke-shift/:id` — Tambah Karyawan ke Shift

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/pegawai` atau `/api/pegawai/by-unit-id-presensi` | `page`, `search` |
| POST | `/api/shift-detail/add-pegawai-to-shift-detail` | `{ shift_detail_id, pegawai_ids[] }` |

**Actions:** `shiftAction.fetchPegawai`, `assignPegawaiToShift`

---

## `/shift_dosen_karyawan` — Shift Karyawan

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/shift` | Daftar shift (dropdown) |
| GET | `/api/pegawai` / `by-unit-id-presensi` | `page`, `search` |
| POST | `/api/shift-detail/add-pegawai-to-shift-detail` | Assign massal |

**Actions:** axios GET shift + `shiftAction.fetchPegawai`, `assignPegawaiToShift`

---

## `/event` — Daftar Event

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/events/get-all-by-unit` | `search`, `is_active`, `unit_id` (super admin) |
| GET | `/api/unit` | Filter unit |
| GET | `/api/pegawai/by-unit-id-presensi` | Modal tambah pegawai |
| GET | `/api/events/history-presensi-event` | Tab history: `unit_id`, `tipe_event`, `tanggal`, `events_id` |
| GET | `/api/events/rekap-presensi-event-pegawai` | Tab rekap event |
| POST | `/api/events/add-pegawai-to-event` | `{ events_id, pegawai_ids[] }` |

**Actions:** `presensiAction.fetchEvent`, `fetchHistoryPresensiEvent`, `fetchRekapPresensiEventPegawai`, `addPegawaiToEvent`, `downloadRekapPresensiEventPegawai` (PDF client-side)

---

## `/event/tambah` — Tambah Event

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/unit` | Super admin |
| POST | `/api/events/create` | Data event + `unit_id` jika super admin |

**Action:** `presensiAction.createEvent`

---

## `/event/:id` — Detail Event

| Method | Endpoint |
|--------|----------|
| GET | `/api/events/get-by-id/:id` |

**Action:** `presensiAction.fetchEventDetail`

---

## `/event/:id/edit` — Edit Event

| Method | Endpoint |
|--------|----------|
| GET | `/api/events/get-by-id/:id` |
| GET | `/api/unit` |
| PUT | `/api/events/update/:id` |

**Actions:** `fetchEventDetail`, `updateEvent`

---

## `/event/:id/pegawai` — Pegawai Event

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/events/get-by-id/:id` | — |
| GET | `/api/events/get-pegawai-events/:eventId` | Daftar peserta |
| GET | `/api/pegawai/by-unit-id-presensi` | `unit_id`, `page`, `search` |
| GET | `/api/unit` | Super admin |
| POST | `/api/events/add-pegawai-to-event` | `{ events_id, pegawai_ids[] }` |
| DELETE | `/api/events/remove-pegawai-from-event` | Body: `{ events_id, pegawai_ids[] }` |

**Actions:** `presensiAction.*`, `pegawaiAction.fetchPegawai2`

---

## `/daftar_libur` — Daftar Libur

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/hari-libur` | Query: `bulan`, `tahun` |
| GET | `/api/unit/with-location` | Pilih unit detail |
| POST | `/api/hari-libur/multiple-create` | Batch tanggal libur |
| PUT | `/api/hari-libur/multiple-update` | Batch update |
| DELETE | `/api/hari-libur/multiple-delete` | `{ unit_detail_ids[], tanggal }` |

**Actions:** `hariLiburAction.*`, `unitDetailAction.fetchUnitDetails`

---

## `/rekap_izin` — Rekap / Setting Izin

Perilaku berbeda per role.

### Super admin — master jenis izin

`jenis` = `izin` | `sakit` | `cuti`

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/{jenis}` | — |
| POST | `/api/{jenis}/create` | `{ jenis }` |
| PUT | `/api/{jenis}/update/:id` | `{ jenis }` |
| DELETE | `/api/{jenis}/delete/:id` | — |

### Admin unit — pengajuan

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/pengajuan-{tab}` | `page`; tab = `izin` \| `cuti` \| `sakit` |
| POST | `/api/pengajuan-{tab}/approve/:id` | `{ status, keterangan_admin }` |

**File:** `DataIzin.jsx` (axios langsung)

**Lampiran:** URL file `GET {VITE_API_URL}/storage/{path}`

---

## `/dinas` — Dinas

| Method | Endpoint | Query / body |
|--------|----------|--------------|
| GET | `/api/dinas/get-all` | `tahun`, `bulan`, `unit_id` (super admin) |
| GET | `/api/pegawai` / `by-unit-id-presensi` | Modal edit |
| GET | `/api/unit` | Super admin |
| PUT | `/api/dinas/edit/:id` | Data dinas + `pegawai_ids` |
| DELETE | `/api/dinas/delete/:id` | — |

**Actions:** `presensiAction.fetchDinasData`, `pegawaiAction.fetchPegawai`, axios di halaman

---

## `/dinas/tambah` — Tambah Dinas

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/dinas/create` | `unit_id`, `tanggal_mulai`, `tanggal_selesai`, `keterangan`, `pegawai_ids[]` |
| GET | `/api/pegawai/by-unit-id-presensi` | Pilih pegawai |
| GET | `/api/unit` | Super admin |

---

## `/rekap_presensi` — Rekap Presensi Bulanan

Halaman induk dengan **tab**. Setiap tab memanggil API berbeda.

### Tab History Presensi (`HistoryPresensi.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/presensi/history-by-unit` | `bulan=YYYY-MM` |

> Admin unit & super admin (super admin tanpa tab history di UI).

### Tab Rekap Presensi Pegawai (`RekapPresensiPegawai.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/pegawai` atau `by-unit-id-presensi` | `page`, `search` |

Drill-down ke `/presensi/rekap-bulanan-pegawai/:pegawai_id`:

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/presensi/rekap-bulanan-pegawai` | `pegawai_id`, `tahun`, `unit_id` (opsional) |

### Tab Rekap Lembur (`RekapLemburPegawai.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/presensi/overtime` | `bulan`, `tahun`, `unit_id` (super admin filter) |
| GET | `/api/unit` | Filter unit |

### Tab Rekap Lauk Pauk (`RekapLaukPauk.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/lauk-pauk/by-admin-unit` | `unit_id` (super admin) |
| GET | `/api/presensi/rekap-bulanan-semua-pegawai` | `bulan`, `tahun`, `unit_id` |
| POST | `/api/lauk-pauk/create` | `?unit_id=` (super admin) |
| PUT | `/api/lauk-pauk/update/:id` | Query `unit_id` |
| DELETE | `/api/lauk-pauk/delete/:id` | — |
| GET | `/api/unit` | Filter |

**Actions:** `laukPaukAction.*`, fetch langsung untuk rekap bulanan

### Tab Setting Presensi (`SettingPresensi.jsx`) — admin unit

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/pegawai/by-unit-id-presensi` | `page`, `search` |
| POST | `/api/presensi/admin-presensi-pegawai` | `{ tanggal, keterangan, pegawai_ids[] }` |

---

## `/presensi/rekap-bulanan-pegawai/:pegawai_id`

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/presensi/rekap-bulanan-pegawai` | `pegawai_id`, `tahun`, `unit_id` |
| GET | `/api/pegawai` / `by-unit-id-presensi` | Info pegawai |

**Action:** `presensiAction.fetchPresensiRekapBulananPegawai`

---

## `/presensi/detail-history-presensi/:pegawai_id/:unit_id`

| Method | Endpoint | Query / body |
|--------|----------|--------------|
| GET | `/api/presensi/detail-history-by-unit` | `pegawai_id`, `from`, `to`, `unit_id` (super admin) |
| PUT | `/api/presensi/update-by-admin-unit/:pegawai_id/:tanggal` | `{ updates: [{ waktu_masuk, waktu_pulang, status_*, keterangan_*, status_presensi }] }` |
| GET | `/api/pegawai` | Refresh data pegawai |

**Actions:** `fetchPresensiDetailHistoryByUnit` + fetch PUT di halaman

---

## `/presensi/laporan-kehadiran/:pegawai_id`

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/presensi/laporan-kehadiran-karyawan/:pegawai_id` | `bulan`, `tahun`, `unit_id` |

**Action:** `presensiAction.fetchLaporanKehadiranPegawai`

---

## `/monitoring_presensi` — Monitoring Presensi

Role **`monitoring`**. Struktur tab mirip rekap presensi, dengan filter `unit_id` dari unit yang di-assign.

### Tab History (`HistoryPresensiMonitoring.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/admin/monitoring/get-unit` | — |
| GET | `/api/presensi/history-by-unit` | `bulan=YYYY-MM`, `unit_id` |

### Tab Rekap Pegawai (`RekapPresensiPegawaiMonitoring.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/admin/monitoring/get-unit` | — |
| GET | `/api/pegawai/by-unit-id-presensi` | `unit_id`, `page`, `search` |

Nested: `/monitoring_presensi/rekap-bulanan-pegawai/:pegawai_id` → sama seperti rekap bulanan + `unit_id`.

### Tab Lembur (`RekapLemburPegawaiMonitoring.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/presensi/overtime` | `bulan`, `tahun`, `unit_id` |

### Tab Lauk Pauk (`RekapLaukPaukMonitoring.jsx`)

| Method | Endpoint | Query |
|--------|----------|-------|
| GET | `/api/lauk-pauk/by-admin-unit` | `unit_id` |
| GET | `/api/presensi/rekap-bulanan-semua-pegawai` | `unit_id`, `bulan`, `tahun` |

Nested routes (shared components):

- `/monitoring_presensi/detail-history-presensi/:pegawai_id/:unit_id`
- `/monitoring_presensi/laporan-kehadiran/:pegawai_id`

API sama dengan path `/presensi/...` di atas.

---

## `/import_csv` — Import Data CSV

| Status | Keterangan |
|--------|------------|
| **Belum terhubung API** | UI preview dummy; upload hanya simulasi `alert` |

---

## Endpoint terdefinisi tetapi tidak dipakai halaman

Action berikut ada di `presensiAction.js` tetapi **tidak dipanggil** dari komponen saat ini:

| Method | Endpoint |
|--------|----------|
| GET | `/api/presensi/history-by-unit?tanggal=` (tanpa `bulan`) |
| GET | `/api/presensi/rekap-by-unit` |

---

## Referensi cepat: file action

| Domain | File action |
|--------|-------------|
| Auth | `authAction.js` |
| Dashboard | `dashboardAction.js` |
| Admin | `adminAction.js`, `adminMonitoringAction.js` |
| Pegawai | `pegawaiAction.js` |
| Unit / lokasi | `unitDetailAction.js`, `unitAction.js` |
| Shift | `shiftAction.js` |
| Presensi & event | `presensiAction.js` |
| Hari libur | `hariLiburAction.js` |
| Lauk pauk | `laukPaukAction.js` |
| Izin | `izinAction.js` (sebagian duplikat dengan `DataIzin.jsx`) |
