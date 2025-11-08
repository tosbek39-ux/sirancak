# Setup Guide - Supabase Configuration

## 🎯 Tujuan
Panduan lengkap untuk mengkonfigurasi Supabase agar fitur Add User dan Add Department berfungsi dengan baik.

---

## 📋 Pilihan Setup

### Opsi A: Supabase Cloud (Recommended untuk Production)

#### Langkah 1: Buat Akun Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Klik "Sign Up"
3. Daftar dengan email atau GitHub
4. Verifikasi email Anda

#### Langkah 2: Buat Project Baru
1. Klik "New Project"
2. Isi nama project (misal: "sirancak")
3. Pilih region terdekat
4. Buat password database yang kuat
5. Klik "Create new project"

#### Langkah 3: Dapatkan Credentials
1. Buka project Anda
2. Klik "Settings" (⚙️) di sidebar
3. Pilih "API"
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Langkah 4: Update .env
```bash
# Buka file .env di root project
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

#### Langkah 5: Setup Database Schema
1. Buka Supabase Dashboard
2. Klik "SQL Editor" di sidebar
3. Klik "New Query"
4. Copy-paste seluruh isi file `database-schema.sql`
5. Klik "Run" atau tekan Ctrl+Enter

---

### Opsi B: Supabase Local (Recommended untuk Development)

#### Langkah 1: Install Supabase CLI
```bash
# Install Node.js dulu jika belum
npm install -g supabase
```

#### Langkah 2: Initialize Supabase Project
```bash
cd /home/ubuntu/project/app
supabase init
```

#### Langkah 3: Start Supabase
```bash
supabase start
```

Output akan menampilkan:
```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Langkah 4: Update .env
```bash
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Langkah 5: Setup Database Schema
```bash
# Copy database schema ke migrations folder
cp database-schema.sql supabase/migrations/$(date +%s)_init.sql

# Atau jalankan langsung via SQL Editor di http://localhost:54323
```

---

## 🔧 Setup Database Schema

### Metode 1: Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Klik "SQL Editor"
3. Klik "New Query"
4. Copy-paste isi file `database-schema.sql`
5. Klik "Run"

### Metode 2: Via CLI (Local Only)
```bash
supabase db push
```

### Metode 3: Via psql (Local Only)
```bash
# Dapatkan connection string dari: supabase status
psql "postgresql://postgres:postgres@localhost:54322/postgres" < database-schema.sql
```

---

## ✅ Verifikasi Setup

### 1. Cek Koneksi Supabase
```bash
cd /home/ubuntu/project/app
npm install
npm run dev
```

Buka browser ke `http://localhost:3000`

### 2. Cek Database Tables
1. Buka Supabase Dashboard
2. Klik "Table Editor" di sidebar
3. Pastikan tabel berikut ada:
   - ✅ `users`
   - ✅ `departments`
   - ✅ `leave_types`
   - ✅ `leave_requests`
   - ✅ `notifications`
   - ✅ `log_entries`
   - ✅ `app_settings`

### 3. Test Add Department
1. Login ke aplikasi sebagai Admin
2. Buka halaman `/admin/departments`
3. Klik "Add Department"
4. Isi nama department (misal: "Test Department")
5. Klik "Add Department"
6. Verifikasi di Supabase Dashboard → Table Editor → departments

### 4. Test Add User
1. Login ke aplikasi sebagai Admin
2. Buka halaman `/admin/users`
3. Klik "Add User"
4. Isi semua field yang diperlukan
5. Klik "Add User"
6. Verifikasi di Supabase Dashboard → Table Editor → users

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
**Solusi:**
- Pastikan file `.env` memiliki `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server setelah mengubah `.env`

### Error: "Cannot find module './supabase'"
**Solusi:**
- Sudah diperbaiki di `src/supabase-service.ts`
- Import path sekarang benar: `from './lib/supabaseClient'`

### Data tidak tersimpan ke Supabase
**Solusi:**
1. Pastikan Supabase URL dan key benar
2. Pastikan database schema sudah dijalankan
3. Cek Row Level Security (RLS) policies:
   - Buka Supabase Dashboard
   - Klik "Authentication" → "Policies"
   - Pastikan policies mengizinkan INSERT, UPDATE, DELETE

### Halaman Add Department/User tidak merespons
**Solusi:**
1. Buka browser console (F12)
2. Cek error messages di tab Console
3. Buka tab Network untuk melihat request yang gagal
4. Pastikan Supabase server berjalan (local) atau online (cloud)

### Row Level Security (RLS) Error
**Solusi:**
1. Buka Supabase Dashboard
2. Klik "Authentication" → "Policies"
3. Untuk development, bisa disable RLS:
   - Klik table → "Policies"
   - Klik "New Policy" → "For full customization"
   - Pilih "Allow all operations" untuk development
4. Untuk production, setup proper policies

---

## 📚 File Penting

| File | Deskripsi |
|------|-----------|
| `.env` | Konfigurasi Supabase (JANGAN commit ke git) |
| `.env.example` | Template .env (boleh commit) |
| `database-schema.sql` | SQL schema untuk database |
| `src/supabase-service.ts` | Service layer untuk Supabase |
| `src/lib/data-supabase.ts` | Data access layer |
| `src/lib/supabaseClient.ts` | Supabase client initialization |

---

## 🎓 Referensi

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📞 Support

Jika mengalami masalah:
1. Baca error message di console dengan teliti
2. Cek dokumentasi Supabase
3. Cek file `PERBAIKAN_FITUR.md` untuk detail perubahan
4. Cek file `RINGKASAN_PERUBAHAN.md` untuk detail kode

---

**Terakhir diperbarui**: November 9, 2025
