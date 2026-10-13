# Playwright OrangeHRM Automation with AI Agents

Automated End-to-End (E2E) testing framework yang dibangun menggunakan **Playwright**, **TypeScript**, dan terintegrasi dengan **AI Agentic Coding Workflows** untuk aplikasi [OrangeHRM Open Source Demo](https://opensource-demo.orangehrmlive.com).

Project ini dirancang untuk mendemonstrasikan kolaborasi antara otomatisasi QA modern dan AI Agent: mulai dari pembacaan skenario dari **Google Sheets**, penyusunan **Test Plan** terstruktur, pembuatan **Page Object Model (POM)**, hingga eksekusi test dan pelaporan otomatis.

---

## 🚀 Fitur Unggulan

- **Page Object Model (POM)**: Enkapsulasi elemen dan aksi UI di dalam direktori `src/pages/` dengan locator berbasis aksesibilitas (`getByRole`, `getByPlaceholder`, `getByLabel`).
- **Custom Fixtures & Dependency Injection**: Pemanfaatan fixture Playwright di `src/fixtures/base.fixture.ts` sehingga Page Objects diinjeksi langsung ke dalam test spec tanpa inisialisasi manual.
- **Agentic Workflow Integration**:
  - `/create-plan`: Mengambil skenario dari Google Sheets yang berstatus `Uncreate`, menyusun dokumen test plan (`docs/test-plans/plan-{TC_ID}.md`), dan mengubah status menjadi `Planned`.
  - `/implement`: Menghasilkan/memperbarui Page Object, custom fixture, test spec, memverifikasi eksekusi test, dan mengubah status di sheet menjadi `Created`.
- **Dynamic Google Sheets Synchronization**: Integrasi fleksibel melalui `GoogleSheetsHelper` (`src/helpers/sheets.helper.ts`) yang mendeteksi kolom secara dinamis (`TC ID`, `Feature`, `Summary`, `Precondition`, `Step`, `Priority`, `Status AT`).
- **Clean Step-by-Step Terminal Logging**: Menggunakan custom reporter (`src/utils/step-reporter.ts`) yang hanya menampilkan judul skenario dan langkah `test.step()` yang sedang dieksekusi.
- **Screenshot Otomatis saat Terjadi Error**: Konfigurasi `screenshot: 'only-on-failure'` pada `playwright.config.ts` yang otomatis melampirkan screenshot pada Playwright HTML Report jika ada assertion yang gagal.
- **Structured Tagging System**: Memudahkan eksekusi test selektif berbasis tag (`@FE-1`, `@Login`, `@High`, `@smoke`, `@negative`, `@regression`, `@api`).

---

## 📁 Struktur Direktori

```text
tsPlaywright/
├── .agents/                    # Konfigurasi AI Agent (Rules & Skills)
│   ├── rules/                  # Panduan konvensi project, POM, fixtures, sheets
│   └── skills/                 # Agent Skills: create-plan & implement
├── docs/
│   └── test-plans/             # Dokumen rencana pengujian (plan-FE-*.md)
├── src/
│   ├── fixtures/               # Custom Playwright fixtures (base.fixture.ts)
│   ├── helpers/                # Helper API & Google Sheets (sheets.helper.ts)
│   ├── pages/                  # Page Object Model classes (login.page.ts, dll.)
│   ├── test-data/              # Test data terpusat (users.data.ts)
│   └── utils/                  # Custom reporter & utility (step-reporter.ts)
├── tests/
│   ├── ui/                     # UI test specs (login.spec.ts)
│   └── api/                    # API test specs
├── playwright-report/          # HTML report hasil eksekusi pengujian
├── playwright.config.ts        # Konfigurasi utama Playwright
├── .env.example                # Template variabel lingkungan
└── package.json
```

---

## 📋 Prasyarat

Pastikan perangkat Anda telah terinstal:
- [Node.js](https://nodejs.org/) (versi 20 atau yang lebih baru)
- npm (Node Package Manager)

---

## 🛠️ Panduan Instalasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/anggis234/playwright-orangeHRM-Agents.git
   cd playwright-orangeHRM-Agents
   ```

2. **Install dependensi project**:
   ```bash
   npm install
   ```

3. **Install browser binaries Playwright**:
   ```bash
   npx playwright install chromium
   ```

4. **Konfigurasi Environment**:
   Salin file template `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

---

## ⚙️ Konfigurasi Variabel Lingkungan (`.env`)

Isi file `.env` sesuai kebutuhan pengujian:

```env
# Target Application
BASE_URL=https://opensource-demo.orangehrmlive.com
URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123

# Google Sheets Integration (Opsional - Diperlukan jika menggunakan sinkronisasi Google Sheets)
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CLIENT_ID=your_google_client_id_here
GOOGLE_SHEETS_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_SHEETS_REFRESH_TOKEN=your_google_refresh_token_here
```

> **Catatan Keamanan:** Kredensial sensitif Google Sheets (Client ID, Secret, Refresh Token) **tidak disimpan** di repositori publik. Jika Anda ingin menghubungkan spreadsheet pribadi, isi nilai di atas pada file lokal `.env` Anda.

---

## ▶️ Cara Menjalankan Pengujian

### 1. Menjalankan Semua Pengujian
```bash
npx playwright test
```

### 2. Menjalankan File Pengujian Spesifik
```bash
npx playwright test tests/ui/login.spec.ts
```

### 3. Menjalankan Berdasarkan Tag Tertentu
Eksekusi berdasarkan Test ID:
```bash
npx playwright test -g "@FE-1"
```

Eksekusi berdasarkan prioritas / smoke test:
```bash
npx playwright test -g "@smoke"
```

Eksekusi skenario negatif:
```bash
npx playwright test -g "@negative"
```

### 4. Menjalankan dengan Mode Tampilan (Interactive UI Mode)
```bash
npx playwright test --ui
```

### 5. Membuka Laporan Pengujian (HTML Report)
Setelah test selesai, buka report interaktif dengan screenshot dan trace:
```bash
npx playwright show-report
```

---

## 🤖 Alur Kerja AI Agent (Agentic Workflow)

Project ini dilengkapi dengan skill agent yang dapat dijalankan langsung di lingkungan Antigravity:

1. **Membuat Test Plan dari Skenario Baru**:
   ```text
   /create-plan
   ```
   *Atau untuk TC ID tertentu:*
   ```text
   /create-plan FE-2
   ```
   > **Aturan**: Sistem hanya akan memproses skenario yang memiliki status `Status AT = Uncreate` pada spreadsheet untuk menghindari duplikasi. Setelah plan dibuat di `docs/test-plans/`, status diupdate menjadi `Planned`.

2. **Mengimplementasikan Otomatisasi Test**:
   ```text
   /implement
   ```
   > Sistem membaca test plan, menyusun Page Object & test spec dengan `test.step()`, memverifikasi tes berjalan hijau (passed), dan mengupdate status di spreadsheet menjadi `Created`.

---

## 📄 Lisensi

Project ini dilisensikan di bawah lisensi ISC.
