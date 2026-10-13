# Test Plan: FE-2 - Login with invalid username

**Source**: Google Sheets (Scenario OrangeHRM)  
**Spreadsheet ID**: `1bKkHtU7XX7y3YDC2urEegC2Gx803605Xxn92QNhDWPY`  
**Sheet**: `All Scenario`  
**Test Case ID**: FE-2  
**Category**: Frontend UI  
**Feature**: Login  
**Summary**: Login with invalid username  
**Priority**: High  
**Tags**: `@FE-2` `@Login` `@High` `@negative` `@regression`  

---

## Prerequisites
- [X] Base URL target aplikasi terkonfigurasi di `.env` (OrangeHRM Demo: `https://opensource-demo.orangehrmlive.com`)
- [X] Kredensial akun uji tersedia di `src/test-data/` (invalid username: `test123`, valid password: `admin123`)
- [X] Browser engine Playwright terinstal

## Test Steps
1. Buka halaman login OrangeHRM (`/web/index.php/auth/login`)
2. Masukkan username tidak valid (`test123`) ke field input Username
3. Masukkan password valid (`admin123`) ke field input Password
4. Klik tombol **Login**

## Expected Result
- Halaman tetap berada di URL login (`/web/index.php/auth/login`)
- Komponen pesan alert error tampil di layar
- Pesan kesalahan berisi teks **"Invalid credentials"**
- Pengguna tidak diarahkan ke halaman Dashboard
