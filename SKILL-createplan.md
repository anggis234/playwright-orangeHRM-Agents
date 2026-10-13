---
name: create-plan
description: >-
  Turn a test scenario from Google Sheets into an automation-oriented test plan file (plan-{id}.md).
  HANYA memproses skenario yang memiliki Status AT = Uncreate.
  Fetches scenario details (TC ID like FE-1 or BE-1, Feature, Summary, Precondition, Steps, Priority) via Google Sheets,
  structures actions and verifications, maps Playwright tags, and writes the test plan.
---

# Plan Test Case from Google Sheets

## Goal
Turn a test scenario from Google Sheets into a concise, automation-oriented test plan file: `docs/test-plans/plan-{TC_ID}.md`.
The test case details (TC ID, Feature, Summary, Precondition, Steps, Priority, Status AT) are retrieved from the project's test scenario spreadsheet.

---

## 1. Input & Filter Rule (HANYA Status AT = Uncreate)

> [!IMPORTANT]
> **Aturan Wajib:** Pembuatan test plan **HANYA** diperbolehkan untuk skenario yang memiliki status `Status AT = Uncreate` (atau `UnCreate` / case-insensitive).

Pilihan input:
1. **Pencarian Otomatis (Next Uncreated Scenario)** *(Default)*:
   - Ambil skenario pertama yang berstatus `Uncreate` di Google Sheets menggunakan `GoogleSheetsHelper.getNextUncreatedTestCase()`.
   - Jika tidak ada skenario dengan status `Uncreate`, **STOP** dan informasikan ke user:
     > ℹ️ Semua skenario di Google Sheets sudah diproses atau tidak ada yang berstatus `Uncreate`.
2. **Spesifik TC ID**:
   - Jika user meminta TC ID tertentu (contoh: `FE-2`, `BE-1`, atau nomor `2`), ambil data via `GoogleSheetsHelper.getTestCase(tcId)`.
   - **Validasi Status**:
     - Jika `statusAt.toLowerCase() !== 'uncreate'`:
       **STOP dan tolak pembuatan plan**:
       > ⚠️ Test Case `{TC_ID}` saat ini memiliki Status AT: **`{statusAt}`** (bukan `Uncreate`). Pembuatan plan dibatalkan untuk mencegah duplikasi skenario yang sudah planned/created.
     - Jika `statusAt.toLowerCase() === 'uncreate'`:
       Lanjutkan ke proses pembuatan plan.
3. **Detail Spreadsheet**:
   - **Spreadsheet Name**: `Scenario OrangeHRM`
   - **Spreadsheet ID**: `1bKkHtU7XX7y3YDC2urEegC2Gx803605Xxn92QNhDWPY`
   - **Sheet Name**: `All Scenario`

---

## 2. Fetch Details from Google Sheets
Gunakan `GoogleSheetsHelper` di `src/helpers/sheets.helper.ts` untuk membaca skenario dari Google Sheets:
- `TC ID` (Column A): e.g. `FE-1`, `FE-2`, `BE-1`
- `Feature` (Column B): e.g. `Login`
- `Summary` (Column C): e.g. `Login with invalid username`
- `Precondition` (Column D): Precondition requirements dari sheet (jika ada)
- `Step` (Column E): Step-by-step user/API instructions
- `Priority` (Column F): `High`, `Medium`, `Low`
- `Status AT` (Column G): `Uncreate`, `UnCreate`, `Planned`, `Created`

---

## 3. Split and Rewrite Content

Identifikasi tipe skenario berdasarkan prefix `TC ID`:
- **`FE-*` (Frontend UI)**: Interaksi antarmuka pengguna, form input, button click, navigasi, dan UI assertions.
- **`BE-*` (Backend API)**: Endpoint URL, HTTP methods (GET, POST, PUT, DELETE), headers/body request, status code HTTP, dan verifikasi JSON response.

### A. Prerequisites Checklist (`[X]` / `[ ]`)
Gabungkan data kolom `Precondition` dengan prasyarat teknis:
- Sertakan teks `Precondition` dari spreadsheet jika terisi.
- Sertakan baseline teknis:
  - Base URL aplikasi terkonfigurasi di `.env` / `playwright.config.ts`.
  - Kredensial / test data disiapkan di `src/test-data/` atau `.env`.
  - Browser Playwright siap (untuk FE) atau API Request Context siap (untuk BE).
- Awali setiap poin dengan `[X]` (ready) atau `[ ]` (needs setup).

### B. Test Steps (Actions Only)
- **Untuk `FE-*`**: Daftar aksi UI terurut (input, click, select).
- **Untuk `BE-*`**: Daftar aksi pemanggilan API terurut (endpoint, payload, headers).

### C. Expected Results (Observable Outcomes)
- **Untuk `FE-*`**: Assertion UI yang terukur (URL redirect, header judul tampil, alert error message visible).
- **Untuk `BE-*`**: Assertion response API yang terukur (status code 200/400/401, properti JSON response).

### D. Title vs Expected Result Validation
Validasi `Summary` dengan `Expected Result`:
- Jika summary mengindikasikan skenario negatif ("Login with invalid username"), pastikan assertion memvalidasi pesan kesalahan (contoh: "Invalid credentials").

---

## 4. Determine Playwright Tags
Petakan tags secara otomatis:

1. **Test ID Tag**: `@{TC_ID}` (e.g., `@FE-1`, `@FE-2` untuk UI; `@BE-1` untuk API)
2. **Feature Tag**: `@` + Feature name tanpa spasi (e.g., `@Login`, `@Dashboard`, `@PIM`, `@Admin`)
3. **Priority Tag**: `@` + Priority (e.g., `@High`, `@Medium`, `@Low`)
4. **Test Type Tags**:
   - Tambahkan `@smoke` jika Priority `High` dan merupakan alur sukses utama.
   - Tambahkan `@negative` jika skenario menguji input invalid / error flow.
   - Tambahkan `@api` jika kategori adalah `BE-*`.
   - Selalu sertakan `@regression`.

**Tag Order Standard:**
`@{TC_ID} @{Feature} @{Priority} [@smoke/@negative] [@api] @regression`

*Contoh FE UI (Negatif):*
```typescript
{ tag: ["@FE-2", "@Login", "@High", "@negative", "@regression"] }
```

---

## 5. Write the Plan File
- **Direktori**: `docs/test-plans/`
- **Nama File**: `plan-{TC_ID}.md` (contoh: `docs/test-plans/plan-FE-2.md`)

### Format Plan:
```markdown
# Test Plan: {TC_ID} - {Summary}

**Source**: Google Sheets (Scenario OrangeHRM)  
**Spreadsheet ID**: 1bKkHtU7XX7y3YDC2urEegC2Gx803605Xxn92QNhDWPY  
**Sheet**: All Scenario  
**Test Case ID**: {TC_ID}  
**Category**: {Frontend UI | Backend API}  
**Feature**: {Feature}  
**Summary**: {Summary}  
**Priority**: {Priority}  
**Tags**: @{TC_ID} @{Feature} @{Priority} [@smoke/@negative] [@api] @regression  

---

## Prerequisites
- [X] Precondition: {Precondition from sheet or verified setup}
- [X] Base URL target aplikasi terkonfigurasi di .env
- [X] Kredensial akun uji tersedia di src/test-data/

## Test Steps
1. Buka halaman login (/web/index.php/auth/login)
2. Masukkan input data
3. Klik tombol aksi

## Expected Result
- Hasil yang diharapkan dan verifikasi assertion
```

---

## 6. Update Google Sheets Status
Setelah file plan berhasil dibuat dan disimpan:
- Update nilai kolom `Status AT` (Kolom G) di spreadsheet `All Scenario` untuk `{TC_ID}` dari `Uncreate` / `UnCreate` menjadi **`Planned`** menggunakan:
  ```typescript
  await GoogleSheetsHelper.updateTestCaseStatus(tcId, "Planned");
  ```

---

## 7. Next Step (Implementation)
Setelah `plan-{TC_ID}.md` selesai dibuat:
1. Review dengan user.
2. Jalankan `/implement` untuk mengotomasi skenario tersebut ke dalam Playwright.
