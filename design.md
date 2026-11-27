# Spesifikasi Desain dan Sistem UI (`design.md`)

**Proyek:** Seoul Weather & Heatwave Prediction Dashboard  
**Mode Antarmuka (`impeccable`):** Operate (Operational Analytical Tool)  
**Mode Antislop:** DURING (diterapkan sejak perancangan hingga implementasi)

---

## 1. Design Read, Three Dials, dan Liveliness Levers

> **Design Read:** Reading this as: operational daily temperature and heatwave prediction dashboard for meteorology students, lecturers, and Seoul civil-safety demo viewers, in a Light Editorial Meteorology style, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

`Dial: ENERGY 2 / RHYTHM 2 / MOTION 1`

### Penerapan Three Dials

| Dial | Level | Penerapan Konkret pada Dashboard |
|:---|:---:|:---|
| **ENERGY** | **2 (Balanced)** | Permukaan terang yang tenang untuk input 21 angka meteorologi, dipadukan dengan tipografi angka prediksi utama (`Next_Tmax`) yang besar dan pita peringatan termal yang tegas ketika suhu melewati ambang bahaya. |
| **RHYTHM** | **2 (Consistent with breaks)** | Struktur utama memakai dua kolom asimetris (`46%` panel kontrol kiri, `54%` panel hasil kanan). Di sisi kanan, ritme dipecah secara sengaja antara kartu metrik hero + gauge di atas, banner peringatan berlebar penuh, dua blok ringkas sejajar (`Delta T` & rekomendasi kesehatan), lalu grafik feature importance dan riwayat di bawah. |
| **MOTION** | **1 (State-driven)** | Transisi `150 - 200ms ease-out` hanya untuk respons interaksi (perpindahan tab, hover/fokus kontrol, serta pergerakan jarum gauge saat hasil prediksi baru diterima). Tidak ada animasi loop, pulse, atau efek masuk bertahap saat halaman pertama kali dimuat. |

### Five Liveliness Levers

1. **One focal point per screen:** Kartu prediksi suhu maksimum esok hari (`Next_Tmax`) beserta *Thermal Scale Gauge* menjadi satu-satunya titik fokus utama di sisi kanan; semua elemen lain mendukung pembacaan keputusan termal.
2. **Hierarchical contrast:** Memakai `tabular-nums` dan perbedaan ukuran serta bobot huruf yang tegas antara angka prediksi (`3.5rem`), status peringatan, dan input form (`0.9375rem`).
3. **Whitespace as structure:** Ruang kosong antar kelompok kontrol (`24px` antar panel, `16px` antar grup input) memisahkan alur input dari area hasil tanpa bergantung pada bayangan tebal.
4. **One deliberate accent:** **Meteorological Cobalt (`#1E40AF`)** digunakan secara selektif hanya pada tombol aksi utama (*Prediksi Suhu Esok Hari*), penanda tab aktif, dan *focus ring* aksesibilitas.
5. **Identity motif:** **Calibrated Thermal Scale** (skala penggaris suhu terkalibrasi dengan tanda titik batas `25 °C`, `30 °C`, `33 °C`, dan `35 °C`) yang muncul konsisten pada gauge utama dan indikator perbandingan suhu.

---

## 2. Sistem Warna dan Skala Termal 5-Level

### Palet Netral dan Aksen Inti (`R-29`)

Palet dibatasi pada permukaan netral terkalibrasi ditambah satu aksen utama (`#1E40AF`). Warna semantik termal hanya muncul sebagai indikator status suhu yang sah secara fungsional.

| Token | Nilai Hex | Peran | Rasio Kontras Terukur (WCAG AA) |
|:---|:---|:---|:---|
| `--bg-canvas` | `#F6F7F9` | Latar kanvas utama (sedikit sejuk seperti kertas catatan cuaca) | Latar dasar |
| `--surface-primary` | `#FFFFFF` | Permukaan panel input, kartu hasil, dan tabel | Latar panel |
| `--surface-secondary` | `#EEF1F5` | Latar strip header sekunder, latar tab non-aktif, area dropzone CSV | Latar sekunder |
| `--border-subtle` | `#D8DFE8` | Garis batas kartu, input, dan pemisah tabel | Pemisah struktural |
| `--ink-primary` | `#0F172A` | Judul, nilai suhu utama, dan teks input aktif | `17.85:1` di atas `#FFFFFF` |
| `--ink-secondary` | `#475569` | Label field form, deskripsi banner, dan subjudul | `7.07:1` di atas `#F6F7F9` |
| `--ink-muted` | `#526071` | Satuan input (`°C`, `Wh/m2`), metadata rentang, dan catatan kaki | `5.99:1` di atas `#F6F7F9` |
| `--accent-primary` | `#1E40AF` | Tombol aksi utama, indikator tab aktif, dan focus ring | `8.72:1` teks `#FFFFFF` di atas `#1E40AF` |
| `--accent-hover` | `#1E3A8A` | State hover tombol aksi utama | `> 9.5:1` |
| `--accent-tint` | `#EFF6FF` | Sorotan baris/preset yang sedang dipilih | Tinted surface |

### Skala Semantik Termal 5-Level (Sinkron `F-UI-07` & `F-UI-08`)

Untuk mengatasi ketidaksinkronan antara `F-UI-07` dan `F-UI-08` pada `PRD.md`, seluruh komponen visual (Gauge, Banner Peringatan Dini, Tag Status Tabel Batch, dan Riwayat Sesi) wajib memakai **satu skala tunggal 5 tingkat**:

| Level (`heatwave_status`) | Rentang `Next_Tmax` | Label Resmi UI | Teks (`--thermal-ink`) | Permukaan (`--thermal-bg`) | Garis/Segmen Gauge | Kontras Teks/Latar |
|:---|:---|:---|:---|:---|:---|:---|
| `cool` | `< 25.0 °C` | Sejuk | `#075985` | `#E0F2FE` | `#0284C7` | `6.59:1` |
| `normal` | `25.0 - 29.9 °C` | Nyaman | `#166534` | `#DCFCE7` | `#16A34A` | `6.49:1` |
| `warm` | `30.0 - 32.9 °C` | Hangat (Waspada) | `#92400E` | `#FEF3C7` | `#D97706` | `6.37:1` |
| `advisory` | `33.0 - 34.9 °C` | Siaga Gelombang Panas | `#9A3412` | `#FFEDD5` | `#EA580C` | `6.38:1` |
| `warning` | `>= 35.0 °C` | Bahaya Gelombang Panas Ekstrem | `#991B1B` | `#FEE2E2` | `#DC2626` | `6.80:1` |

### Larangan Visual Eksplisit (`antislop-ui`)

- Dilarang memakai gradien dekoratif biru-ungu, cyan, atau glow di belakang kartu maupun tombol.
- Dilarang memakai glassmorphism (`backdrop-filter: blur`) di kartu, navbar, dan sidebar.
- Dilarang memakai latar belakang grid kotak-kotak/dot-matrix bergaya blueprint.
- Dilarang memakai garis vertikal berwarna dekoratif di sisi kiri kartu (*colored left stripe*). Status peringatan ditunjukkan melalui kontainer semantik utuh (latar lembut + border + ikon status + label teks eksplisit).

---

## 3. Tipografi (Operate Mode)

- **Font Family:** **Source Sans 3** (dengan fallback `system-ui, -apple-system, 'Segoe UI', sans-serif`). Dipilih karena dirancang untuk keterbacaan antarmuka padat data dan memiliki bentuk angka yang jelas serta mudah dibedakan pada ukuran kecil, tanpa mengandalkan daftar font default AI.
- **Angka Terkalibrasi:** Terapkan `font-variant-numeric: tabular-nums` pada semua nilai suhu, selisih `Delta T`, koordinat (`lat`, `lon`), nilai `Solar radiation`, persentase *feature importance*, dan seluruh sel angka di tabel.
- **Skala Ukuran Tetap (`rem`, bukan `clamp` dekoratif sesuai panduan *Operate*):**
  - Hero Predicted Temperature (`Next_Tmax`): `3.5rem` (desktop) / `2.75rem` (mobile), font-weight `700`, line-height `1.05`.
  - Page Header Title: `1.375rem` (`22px`), font-weight `700`.
  - Panel & Section Heading: `1.0625rem` (`17px`), font-weight `600`.
  - Body, Input Value, & Button Label: `0.9375rem` (`15px`), font-weight `400` / `600`.
  - Form Label, Unit Badge, & Helper Text: `0.8125rem` (`13px`), font-weight `500`.

---

## 4. Ikonografi, Radius, Elevation, dan Motion

- **Ikonografi (`R-04`):** Menggunakan **Phosphor Icons** (`@phosphor-icons/react`, stroke weight konsisten `1.75px`) yang hanya muncul jika memiliki arti meteorologis atau aksi jelas (misal `Thermometer`, `Sun`, `CloudRain`, `Wind`, `MapPin`, `UploadSimple`, `DownloadSimple`, `WarningCircle`, `ArrowCounterClockwise`). **Dilarang** memakai emoji dekoratif (seperti simbol matahari, api, hujan, peringatan, tangan menunjuk, atau segitiga panah pada wireframe awal PRD) di mana pun dalam salinan teks atau kontrol UI.
- **Border Radius (`R-11`, bervariasi sesuai peran elemen, tidak seragam pill):**
  - Panel/Kartu utama: `12px`
  - Tombol aksi, input angka, select dropdown, dan tab container: `8px`
  - Tag status termal dan unit suffix: `6px`
  - Progress/importance bar: `4px`
- **Elevation (`R-12`):** Mayoritas komponen duduk rata (`flat`) di atas kanvas dengan garis batas `1px solid #D8DFE8`. Bayangan halus (`0 4px 16px rgba(15, 23, 42, 0.06)`) hanya diberikan pada **Hero Prediction Card** (untuk menandai titik fokus utama) serta popover/dropdown aktif.
- **Motion (`R-19`, `MOTION 1`):** Durasi `150 - 200ms ease-out` khusus untuk transisi hover/fokus, pergantian tab input, dan animasi jarum *Thermal Gauge* menuju nilai prediksi baru. Respect `prefers-reduced-motion: reduce`.

---

## 5. Arsitektur Layout & Responsivitas 3-State (`R-03`)

Sesuai `antislop-layoutmobile`, layout tidak boleh hanya memiliki dua state (HP langsung lompat ke desktop). Dashboard didefinisikan dalam **3 breakpoint berbasis ruang konten**:

### State 1: Compact / Mobile (`< 720px`)

- **Struktur:** Aliran 1 kolom vertikal penuh (`padding: 16px`, gap antar blok `16px`).
- **Header:** Judul aplikasi ringkas + pill status koneksi (`Mode Simulasi FE` atau `API Terhubung`). Tidak ada tautan navigasi mati (`R-24`).
- **Navigasi Mode Kerja:** Segmented switch **Prediksi Tunggal** | **Batch CSV** yang melebar penuh (`min-height: 44px`).
- **Input Panel:** Tombol preset 3 skenario ditumpuk atau dibuat grid responsif dengan `min-height: 44px` dan jarak minimum `8px`. Tab kategori input (`Lokasi`, `Observasi`, `LDAPS`) mempertahankan ukuran sentuh >= `44px` tanpa teks terpotong atau *horizontal overflow*.
- **Sticky Action Bar Bawah:** Tombol *"Prediksi Suhu Esok Hari"* menempel di bawah layar hanya pada viewport compact agar pengguna tidak perlu menggulir jauh dari tab input mana pun, dengan `padding-bottom: calc(16px + env(safe-area-inset-bottom))` pada wrapper halaman supaya konten terakhir tidak tertutup bar (`antislop-layoutmobile`).
- **Tabel (`F-UI-05` & `F-UI-12`):** Pada layar `< 720px`, tabel riwayat dan preview hasil batch otomatis berubah menjadi daftar kartu baris vertikal (*stacked row cards*) sehingga tidak memicu scroll horizontal di tingkat halaman.

### State 2: Medium / Tablet & Laptop Kecil (`720px - 1099px`)

- **Struktur:** Kontainer terpusat `padding: 20px - 24px`. Panel Input dan Panel Hasil disusun bertumpuk penuh lebar, tetapi **di dalam masing-masing panel** elemen memanfaatkan grid 2 kolom agar form tidak membentang terlalu lebar:
  - Panel Input: Grid 2 kolom untuk 21 field input dan preset 3 kolom sejajar.
  - Panel Hasil: Kartu Hero `Next_Tmax` dan *Thermal Gauge* berdampingan dalam grid 2 kolom, diikuti banner peringatan dan rekomendasi kesehatan di bawahnya.
- Tujuan state ini: mencegah tumpukan kolom tunggal yang terlalu melebar sekaligus mencegah dua kolom utama desktop terjepit.

### State 3: Wide / Desktop (`>= 1100px`)

- **Struktur:** Single Page Dashboard 2 kolom (`max-width: 1360px`, `margin: 0 auto`, `padding: 24px`, `gap: 24px`) sesuai wireframe `PRD.md`:
  - **Kolom Kiri (`46%`, `min-width: 0`):** Kontrol Input Data (`F-UI-01` Dropdown Stasiun, `F-UI-02` 3 Tombol Preset, `F-UI-03` Form 3 Tab 21 Fitur, `F-UI-04` Primary Predict Button, dan `F-UI-05` Area Batch CSV Upload atau tab kerja terintegrasi).
  - **Kolom Kanan (`54%`, `min-width: 0`):** Visualisasi Hasil (`F-UI-06` Hero Prediction Card, `F-UI-07` Thermal Gauge, `F-UI-08` Early Warning Banner, `F-UI-09` Delta T Indicator, `F-UI-10` Health Advisory, `F-UI-11` Feature Importance Chart).
  - **Bar Bawah Penuh Lebar:** `F-UI-12` Tabel Riwayat Prediksi Sesi (5 prediksi terakhir) dan tabel hasil Batch CSV interaktif saat file diproses.

---

## 6. Spesifikasi Komponen UI (`F-UI-01` s.d. `F-UI-12`)

### Sisi Kiri: Input & Kontrol Data

1. **`F-UI-01` Dropdown Pemilih Stasiun (Smart Auto-fill)**
   - Select box berisi 25 stasiun resmi Seoul (`1 - 25`).
   - Memilih stasiun otomatis mengisi **4 field**: `lat`, `lon`, `DEM`, dan **`Slope`**.
   - Jika pengguna mengubah salah satu dari 4 field geografis secara manual setelah memilih stasiun, label konteks menampilkan keterangan *"Koordinat disesuaikan manual"* agar status sinkron tetap jelas.
2. **`F-UI-02` 3 Tombol Skenario Cepat (1-Click Quick Preset)**
   - Tiga tombol terkelompok dengan ikon meteorologi Phosphor (`SunHorizon`, `ThermometerHot`, `CloudRain`):
     - **Normal Musim Panas** (~29 °C)
     - **Gelombang Panas** (>35 °C)
     - **Hujan dan Berawan** (~21 °C)
   - Mengklik salah satu tombol langsung mengisi 17 parameter cuaca/LDAPS (mempertahankan lokasi stasiun yang sedang dipilih atau memilih stasiun default) dan langsung memberi umpan balik aktif pada preset yang dipilih.
3. **`F-UI-03` Formulir 21 Parameter Terkelompok (3 Tab)**
   - Tab 1: **Lokasi & Topografi** (4 field): `lat` (°N), `lon` (°E), `DEM` (m), `Slope`.
   - Tab 2: **Observasi Hari Ini** (3 field): `Present_Tmax` (°C), `Present_Tmin` (°C), `Solar radiation` (**Wh/m2**, rentang normal `4389 - 5990`).
   - Tab 3: **Prakiraan LDAPS** (14 field):
     - Subgrup Termal & Kelembapan: `LDAPS_Tmax_lapse`, `LDAPS_Tmin_lapse`, `LDAPS_RHmin`, `LDAPS_RHmax`.
     - Subgrup Angin & Fluks: `LDAPS_WS` (m/s), `LDAPS_LH` (W/m2).
     - Subgrup Tutupan Awan (0.0 - 1.0): `LDAPS_CC1`, `LDAPS_CC2`, `LDAPS_CC3`, `LDAPS_CC4`.
     - Subgrup Curah Hujan (mm): `LDAPS_PPT1`, `LDAPS_PPT2`, `LDAPS_PPT3`, `LDAPS_PPT4`.
   - Setiap input menampilkan satuan di sisi kanan dalam field dan hint rentang normal saat terjadi error validasi atau fokus bantuan. Tab yang memiliki error validasi menampilkan jumlah error pada label tab.
4. **`F-UI-04` Tombol Aksi Utama (*Prediksi Suhu Esok Hari*)**
   - Teks spesifik aksi (`R-15`): **"Prediksi Suhu Esok Hari"** (bukan teks generik seperti "Submit" atau "Go").
   - Menampilkan state disabled saat request berlangsung beserta label *"Menghitung prediksi..."*.
5. **`F-UI-05` Unggah Berkas CSV (Batch Prediction)**
   - Area drag-and-drop dan tombol pilih file `.csv`, dilengkapi tombol **"Unduh Contoh Template CSV"** (berisi header eksak 21 kolom model aktual) supaya pengguna atau penguji tidak salah format kolom.
   - Setelah diproses, menampilkan ringkasan jumlah baris valid/gagal, tabel interaktif dengan tag warna skala termal, dan tombol **"Unduh Hasil CSV"**.

### Sisi Kanan & Bagian Bawah: Hasil & Analitik

6. **`F-UI-06` Kartu Metrik Utama (Hero Prediction Card)**
   - Menampilkan angka `Next_Tmax` dalam 1 desimal atau 2 desimal konsisten (misal `34.5 °C`), nama stasiun terpilih, waktu inferensi (`< 10 ms` atau hasil aktual API), dan badge status kategori termal.
   - Ketika berjalan memakai `mockPredictor`, menampilkan keterangan ringkas *"Estimasi Simulasi FE (menunggu API model)"* agar tidak menyamar sebagai output asli `rf_model.joblib` (`R-38`).
7. **`F-UI-07` Visual Calibrated Thermal Gauge**
   - Busur semi-lingkaran SVG (`15 °C - 40 °C`) dengan 5 zona warna identik dengan skala termal di Bagian 2 (`<25`, `25-29.9`, `30-32.9`, `33-34.9`, `>=35`), dilengkapi garis tanda batas angka pada skala sehingga warna bukan sekadar dekorasi melainkan alat baca batas.
8. **`F-UI-08` Banner Peringatan Dini (Heatwave Early Warning)**
   - Banner lebar penuh di bawah hero/gauge dengan warna latar lembut, border semantik, ikon status relevan, judul status resmi, dan deskripsi singkat kondisi termal esok hari.
9. **`F-UI-09` Indikator Selisih Suhu (`Delta T` vs Hari Ini)**
   - Menampilkan selisih `Next_Tmax - Present_Tmax` dengan tanda eksplisit (`+2.3 °C` atau `-1.5 °C`), ikon panah naik/turun fungsional (`TrendUp` / `TrendDown`), dan kalimat kontekstual yang jelas.
10. **`F-UI-10` Kotak Rekomendasi Kesehatan Warga**
    - Daftar 3-4 langkah mitigasi praktis yang berubah dinamis mengikuti 5 level `heatwave_status` (dari anjuran pakaian nyaman pada kondisi sejuk hingga larangan aktivitas luar ruang pukul 12.00-15.00 dan hidrasi ketat pada status Siaga/Bahaya).
11. **`F-UI-11` Grafik Faktor Penentu (Feature Importance Bar Chart)**
    - Judul berbentuk pertanyaan yang dijawab oleh grafik (*"Variabel apa yang paling memengaruhi prediksi model?"*, sesuai panduan `antislop-ui` *Charts Without a Question*).
    - Menampilkan 7 faktor teratas dari bobot aktual `rf_model.joblib` (`LDAPS_Tmax_lapse` 69.5%, `Present_Tmax` 5.4%, `LDAPS_CC1` 3.1%, `LDAPS_CC3` 2.4%, `LDAPS_CC4` 2.3%, `LDAPS_WS` 2.1%, `Solar radiation` 1.8%) beserta nilai input aktual yang sedang dimasukkan pengguna di sebelah masing-masing bar.
12. **`F-UI-12` Tabel Riwayat Prediksi Sesi**
    - Mencatat hingga 5 prediksi terakhir di sesi browser (`localStorage`), menampilkan waktu, stasiun, `Present_Tmax`, `Next_Tmax`, `Delta T`, dan status termal.
    - Setiap baris menyediakan tombol **"Muat Ulang Input"** yang mengembalikan ke-21 nilai input skenario tersebut ke formulir untuk perbandingan cepat saat presentasi.

---

## 7. UI States (`R-27`) dan Aksesibilitas (`R-32`)

### Tiga State Wajib

| Komponen | Empty State | Loading State | Error State |
|:---|:---|:---|:---|
| **Panel Hasil Prediksi** | Panduan singkat 1 kalimat: *"Pilih skenario cepat atau isi parameter cuaca di sebelah kiri, lalu klik Prediksi Suhu Esok Hari."* | Skeleton blok menyerupai posisi Hero, Gauge, dan Banner dengan label *"Memproses 21 parameter cuaca..."* | Kotak pesan penyebab kegagalan + tombol **"Coba Lagi"** atau opsi beralih ke mode simulasi jika server BE belum aktif. |
| **Batch CSV** | Dropzone menjelaskan syarat 21 kolom wajib + tombol unduh template CSV. | Progress bar/status *"Memproses baris CSV..."* | Daftar kolom yang hilang atau daftar nomor baris dengan format nilai tidak valid. |
| **Riwayat Sesi** | *"Belum ada riwayat prediksi di sesi ini. Jalankan prediksi pertama untuk membandingkan skenario."* | Tidak diperlukan (dibaca instan dari memori/localStorage). | Fallback aman jika `localStorage` rusak/penuh tanpa membuat halaman crash. |

### Aksesibilitas Keyboard & Fokus (`R-32`)

- Seluruh tombol, input, dropdown, dan tab dapat dijangkau dengan `Tab` dan `Shift+Tab` sesuai urutan baca visual.
- Tab input (`F-UI-03`) mendukung navigasi `ArrowLeft`/`ArrowRight` sesuai pola WAI-ARIA Tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`).
- Focus ring terlihat jelas (`2px solid #1E40AF` dengan `outline-offset: 2px`) pada semua elemen interaktif, tidak pernah dihapus dengan `outline: none` tanpa pengganti.

---

## 8. Matriks Keputusan Desain 1-Baris (`R-31`)

| Aspek | Keputusan | Alasan Satu Baris |
|:---|:---|:---|
| **Warna Kanvas & Aksen** | `#F6F7F9` + `#FFFFFF` + `#1E40AF` | Permukaan netral terang menjaga keterbacaan tabel dan 21 angka input cuaca, sementara satu aksen kobalt mengunci perhatian ke tombol prediksi utama. |
| **Skala Termal 5-Level** | Biru, Hijau, Amber, Oranye, Merah terpadu | Menyatukan ambang batas gauge (`F-UI-07`) dan banner peringatan (`F-UI-08`) sehingga warna status di kiri dan kanan tidak pernah bertentangan. |
| **Tipografi** | `Source Sans 3` + `tabular-nums` | Memberi jarak kolom angka yang sejajar pada suhu, koordinat, dan riwayat prediksi tanpa mengambil estetika terminal monospace. |
| **Layout** | 2 kolom asimetris `46% / 54%` (desktop), reflow 3 breakpoint | Memisahkan kontrol input padat di kiri dari hasil keputusan cepat di kanan pada desktop, lalu melebur jadi tumpukan nyaman di tablet dan ponsel. |
| **Spacing & Radius** | Panel `12px`, kontrol `8px`, chip `6px`, gap `16px / 24px` | Variasi radius membedakan wadah informasi, elemen interaktif, dan label status tanpa membuat seluruh UI berbentuk pil seragam. |
| **Elevation** | Flat border `#D8DFE8`, shadow hanya di Hero & popover | Mengangkat Hero Prediction Card secara halus sebagai titik fokus tunggal di atas permukaan kartu lainnya yang datar dan tenang. |
| **Ikon & Visual** | Phosphor Icons stroke `1.75px` + SVG Gauge terkalibrasi | Menyampaikan konsep meteorologi dan arah perubahan suhu secara teknis dan presisi tanpa emoji dekoratif atau ilustrasi tempelan. |
| **Motion** | Transisi state `150 - 200ms ease-out`, tanpa loop | Memberi umpan balik perpindahan tab dan pembaruan jarum suhu secara cepat tanpa mengganggu fokus pembacaan angka. |
