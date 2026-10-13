# Test Plan: FE-1 - Login with valid credential

**Source**: Google Sheets (Scenario OrangeHRM)  
**Spreadsheet ID**: `1bKkHtU7XX7y3YDC2urEegC2Gx803605Xxn92QNhDWPY`  
**Sheet**: `All Scenario`  
**Test Case ID**: FE-1  
**Category**: Frontend UI  
**Feature**: Login  
**Summary**: Login with valid credential  
**Priority**: High  
**Tags**: `@FE-1` `@Login` `@High` `@smoke` `@regression`  

---

## Prerequisites
- [X] Base URL target aplikasi terkonfigurasi (OrangeHRM Demo: `https://opensource-demo.orangehrmlive.com`)
- [X] Kredensial akun valid tersedia (`Admin` / `admin123`)
- [X] Browser engine Playwright (Chromium/Firefox/WebKit) terinstal

## Test Steps
1. Buka halaman login OrangeHRM (`/web/index.php/auth/login`)
2. Masukkan username valid (`Admin`) ke field input Username
3. Masukkan password valid (`admin123`) ke field input Password
4. Klik tombol **Login**

## Expected Result
- Pengguna berhasil login dan diarahkan ke halaman Dashboard (`/web/index.php/dashboard/index`)
- Judul heading **Dashboard** tampil di halaman utama
- Sidebar navigasi menu (Admin, PIM, Leave, Time, dll.) terlihat dan dapat diakses
