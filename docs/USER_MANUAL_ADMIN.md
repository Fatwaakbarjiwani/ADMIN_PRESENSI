# User Manual — Admin Presensi

Panduan penggunaan aplikasi **Admin Presensi** untuk administrator. Dokumen ini ditujukan bagi pengguna non-teknis: **Admin Unit**, **Super Admin**, dan **Monitoring**.

---

## Daftar isi

1. [Memulai](#1-memulai)
2. [Peran pengguna](#2-peran-pengguna)
3. [Navigasi umum](#3-navigasi-umum)
4. [Dashboard](#4-dashboard)
5. [Data pegawai](#5-data-pegawai)
6. [Manajemen presensi](#6-manajemen-presensi)
7. [Laporan & rekap](#7-laporan--rekap)
8. [Monitoring (role khusus)](#8-monitoring-role-khusus)
9. [Tips & pertanyaan umum](#9-tips--pertanyaan-umum)

---

## 1. Memulai

### 1.1 Akses aplikasi

1. Buka alamat aplikasi yang diberikan oleh tim IT (biasanya URL production atau `http://localhost:5173` saat uji coba).
2. Anda akan diarahkan ke halaman **Login** jika belum masuk.

### 1.2 Login

1. Masukkan **email** dan **password** akun admin.
2. Klik **Login**.
3. Jika berhasil, Anda masuk ke **Dashboard**.
4. Jika gagal, periksa email/password atau hubungi Super Admin.

### 1.3 Logout

1. Di sidebar kiri, pada kartu profil (di atas menu **DATA PEGAWAI** atau **MONITORING PRESENSI**), klik ikon **logout** (merah).
2. Konfirmasi **Ya, Logout**.

### 1.4 Informasi sesi

- Aplikasi menyimpan token login di browser. Tutup browser atau logout jika memakai komputer bersama.
- Jika halaman kosong setelah refresh, login ulang.

---

## 2. Peran pengguna

| Peran | Siapa | Akses utama |
|-------|--------|-------------|
| **Admin Unit** | Pengelola satu unit kerja | Pegawai unit, shift, lokasi, event, dinas, libur, rekap & izin unit |
| **Super Admin** | Pengelola sistem | Semua unit + **Manajemen Admin**, setting master izin, rekap lintas unit |
| **Monitoring** | Auditor / pengawas | Hanya **Dashboard** + **Monitoring Presensi** (read-only rekap per unit assign) |

Menu sidebar **menyesuaikan otomatis** sesuai role akun Anda.

---

## 3. Navigasi umum

### Sidebar

- **Dashboard** — ringkasan statistik.
- Bagian **DATA PEGAWAI** — kelola pegawai & admin (super admin).
- Bagian **MENEJEMEN PRESENSI** — lokasi, shift, event, libur, dinas.
- Bagian **REPORT** — rekap izin & rekap presensi.

Item menu yang tidak muncul berarti **bukan hak akses** role Anda.

### Layout halaman

Kebanyakan halaman memiliki:

- **Header hijau** — judul modul.
- **Filter** — bulan, tahun, unit, atau pencarian.
- **Tabel / kartu data** — dengan pagination di bawah jika data banyak.

### Notifikasi

Aplikasi memakai popup konfirmasi (SweetAlert) untuk sukses, gagal, dan konfirmasi hapus.

---

## 4. Dashboard

**Menu:** Dashboard (`/`)

### Admin Unit & Super Admin

1. Pilih **bulan** dan **tahun** di filter atas.
2. Lihat ringkasan: jumlah presensi, grafik, dan statistik unit.
3. Beberapa bagian bisa **dibuka/tutup** (ikon panah di header kartu).

### Super Admin

- Dapat melihat agregat sistem; filter unit tergantung implementasi dashboard backend.

### Monitoring

1. **Wajib pilih unit** dari dropdown (hanya unit yang di-assign ke akun Anda).
2. Setelah unit dipilih, statistik dashboard dimuat untuk unit tersebut.

---

## 5. Data pegawai

### 5.1 Pegawai

**Menu:** Pegawai (`/management_pegawai`)

**Admin Unit & Super Admin**

1. Gunakan kotak **Cari Pegawai** untuk filter nama/NIK.
2. Gunakan pagination untuk halaman berikutnya.
3. Klik **Setting Lokasi Pegawai** untuk menetapkan pegawai ke lokasi presensi (unit detail).

#### Setting Lokasi Pegawai

**Path:** `/tambah-karyawan-ke-unit-detail`

1. Pilih **lokasi presensi** (unit detail) dari dropdown.
2. Centang pegawai yang akan presensi di lokasi tersebut.
3. Simpan — pegawai terhubung ke lokasi untuk validasi GPS/geofence di aplikasi mobile.

### 5.2 Manajemen Admin

**Menu:** Menejemen Admin (`/menejemen_admin`) — **hanya Super Admin**

#### Tab Admin

1. Isi form: nama, email, password, role (`admin_unit`), unit, status.
2. **Tambah** akun admin unit baru atau **Edit** dari tabel.
3. **Hapus** admin yang tidak dipakai (konfirmasi).

#### Tab Monitoring

1. Buat akun dengan role monitoring.
2. Pilih **satu atau lebih unit** yang boleh dipantau.
3. Akun monitoring hanya melihat menu Monitoring Presensi.

---

## 6. Manajemen presensi

### 6.1 Atur Lokasi

**Menu:** Atur Lokasi (`/lokasi`)

Digunakan untuk menggambar **area presensi** di peta (polygon).

1. Pilih unit/lokasi dari daftar.
2. Klik **Edit** pada lokasi yang ingin diubah.
3. Di peta: gambar atau sesuaikan polygon (zona hijau/biru, dll.).
4. Simpan — koordinat dikirim ke server.
5. Pegawai hanya bisa absen jika berada di dalam zona yang sudah ditetapkan (sesuai aturan backend).

### 6.2 Shift

**Menu:** Shift (`/atur_shift`)

1. **Tambah shift** — beri nama (mis. *Shift Pagi*). Super Admin pilih unit terlebih dahulu.
2. Klik nama shift untuk masuk **Detail Shift** — atur jam masuk/pulang per hari.
3. **Hapus** shift yang tidak dipakai (hati-hati jika sudah ada pegawai).

**Detail Shift** (`/shift-detail/:id`)

- Tambah baris jadwal (hari, jam masuk, jam pulang).
- Edit atau hapus jadwal detail.

**Tambah karyawan ke shift** — dari detail shift, assign pegawai ke jadwal tertentu.

### 6.3 Shift Karyawan

**Menu:** Shift Karyawan (`/shift_dosen_karyawan`)

Cara cepat assign banyak pegawai:

1. Pilih **shift detail** (jadwal spesifik).
2. Centang pegawai di daftar.
3. Simpan penugasan.

### 6.4 Event

**Menu:** Event (`/event`)

Event adalah kegiatan khusus (rapat, apel, dll.) dengan presensi terpisah dari shift harian.

1. **Tambah Event** — isi nama, tanggal, tipe, unit (super admin), status aktif.
2. Dari daftar event:
   - **Detail** — lihat informasi event.
   - **Edit** — ubah data event.
   - **Pegawai** — kelola peserta event.
3. Tab di halaman event (jika tersedia):
   - **History presensi event**
   - **Rekap presensi event** — bisa unduh PDF.

#### Kelola pegawai event

1. Buka event → **Pegawai**.
2. Tambah pegawai dari daftar unit.
3. Hapus pegawai yang tidak ikut.

### 6.5 Daftar Libur

**Menu:** Daftar Libur (`/daftar_libur`) — **tidak untuk Super Admin**

1. Pilih **bulan** dan **tahun**.
2. Pilih **unit detail** (lokasi).
3. Tandai tanggal libur di kalender / form batch.
4. Simpan — tanggal libur tidak dihitung sebagai hari kerja / alpha (sesuai kebijakan instansi).

### 6.6 Dinas

**Menu:** Dinas (`/dinas`)

1. Filter tahun, bulan, dan unit (super admin).
2. Lihat daftar perjalanan dinas.
3. **Tambah Dinas** — pilih pegawai, tanggal mulai–selesai, keterangan.
4. **Edit** atau **Hapus** entri dinas yang salah.

### 6.7 Rekap / Setting Izin

**Menu:** Rekap Izin (`/rekap_izin`)

#### Super Admin — Setting Izin

Mengelola **master jenis** izin, sakit, cuti:

1. Pilih tab jenis (izin / sakit / cuti).
2. Tambah, edit, atau hapus label jenis pengajuan.

#### Admin Unit — Rekap & persetujuan

1. Pilih tab pengajuan: **izin**, **cuti**, atau **sakit**.
2. Lihat daftar pengajuan pegawai (berpaginasi).
3. Klik **Setujui** atau **Tolak** — isi keterangan opsional.
4. Lampiran bukti (jika ada) bisa dibuka dari link file.

---

## 7. Laporan & rekap

### 7.1 Rekap Presensi Bulanan

**Menu:** Rekap Presensi (`/rekap_presensi`)

Halaman ini punya beberapa **tab**:

| Tab | Fungsi | Role |
|-----|--------|------|
| History Presensi | Riwayat absen per bulan | Admin unit |
| Rekap Presensi Pegawai | Daftar pegawai → detail rekap tahunan | Semua admin |
| Rekap Lembur | Data lembur per bulan | Admin unit |
| Rekap Lauk Pauk | Rekap & input lauk pauk | Semua admin |
| Setting Presensi | Input presensi manual oleh admin | Admin unit |

#### History Presensi

1. Pilih bulan & tahun.
2. Lihat tabel history per pegawai/unit.
3. Klik baris untuk detail jika tersedia.

#### Rekap Presensi Pegawai

1. Cari pegawai.
2. Klik pegawai → halaman **Rekap Bulanan** per tahun.
3. Dari sana bisa buka:
   - **Detail history** — edit waktu/status presensi (jika diizinkan).
   - **Laporan kehadiran** — ringkasan kehadiran per bulan.

#### Edit presensi (Detail History)

1. Buka detail history pegawai.
2. Edit baris tanggal tertentu (jam masuk/pulang, status).
3. Simpan — perubahan tercatat sebagai koreksi admin.

#### Rekap Lembur

1. Filter bulan, tahun, unit (super admin).
2. Lihat dan export data lembur.

#### Rekap Lauk Pauk

1. Kelola data lauk pauk per periode.
2. Lihat rekap bulanan semua pegawai.
3. Unduh PDF jika tombol tersedia.

#### Setting Presensi

Untuk kasus khusus (lupa absen, koreksi massal):

1. Pilih **tanggal** dan **keterangan**.
2. Centang pegawai.
3. Simpan presensi administratif.

---

## 8. Monitoring (role khusus)

**Menu:** Monitoring Presensi (`/monitoring_presensi`)

Akun **monitoring** hanya melihat data, tidak mengelola shift/lokasi/pegawai.

### Langkah awal

1. Login → Dashboard → **pilih unit** yang akan dipantau.
2. Buka **Monitoring Presensi**.

### Tab yang tersedia

| Tab | Isi |
|-----|-----|
| History Presensi | Absensi harian/bulanan unit |
| Rekap Presensi Pegawai | Daftar pegawai + drill-down rekap |
| Rekap Lembur | Overtime unit |
| Rekap Lauk Pauk | Rekap lauk pauk unit |

### Drill-down

Sama seperti admin unit:

- Klik pegawai → rekap bulanan.
- Buka detail history atau laporan kehadiran.

> Monitoring **tidak** dapat approve izin, edit shift, atau mengubah lokasi.

---

## 9. Tips & pertanyaan umum

### Saya tidak melihat menu tertentu

- Periksa **role** di kartu profil sidebar.
- Super Admin tidak melihat **Daftar Libur**.
- Hanya Super Admin yang melihat **Manajemen Admin**.

### Data tidak muncul setelah filter

- Pastikan **unit** sudah dipilih (khusus super admin & monitoring).
- Pastikan **bulan/tahun** sesuai periode data di server.
- Refresh halaman; jika masih kosong, hubungi tim backend.

### Gagal simpan / error merah

- Cek koneksi internet.
- Isi semua field wajib (tanggal, pegawai, keterangan).
- Untuk assign pegawai: pilih minimal satu pegawai dan satu lokasi/shift.

### Presensi pegawai tidak valid di lapangan

1. Pastikan pegawai sudah di-**Setting Lokasi Pegawai**.
2. Pastikan **polygon lokasi** di Atur Lokasi sudah benar.
3. Pastikan pegawai punya **shift** yang sesuai hari kerja.

### Lupa password

Hubungi **Super Admin** untuk reset akun di Manajemen Admin.

### Import CSV

Menu import saat ini **dinonaktifkan** di sidebar. Halaman `/import_csv` masih simulasi — tunggu update dari tim pengembang jika fitur diaktifkan.

### Kontak dukungan

| Masalah | Siapa menghubungi |
|---------|-------------------|
| Akun & hak akses | Super Admin |
| Data pegawai master | HR / tim data kepegawaian |
| Error server / API | Tim IT / pengembang backend |
| Bug tampilan aplikasi | Tim pengembang frontend |

---

## Lampiran: peta menu vs role

```
                    ┌─────────────────┐
                    │     Login       │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Admin Unit          Super Admin           Monitoring
         │                   │                   │
   Dashboard            Dashboard            Dashboard
   Pegawai              Pegawai              (pilih unit)
   Lokasi/Shift/Event   + Manajemen Admin    Monitoring Presensi
   Libur/Dinas          Setting Izin              │
   Rekap & Izin         Rekap (semua unit)        └─ History, Rekap,
                                                  Lembur, Lauk Pauk
```

---

*Terakhir diperbarui sesuai kode frontend Admin Presensi. Jika ada perbedaan dengan sistem live, ikuti perilaku aplikasi production.*
