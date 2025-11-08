# Dokumentasi Perbaikan Fitur Add User, Add Department, dan Penyimpanan Data

## 📋 Ringkasan Masalah yang Diperbaiki

Proyek Anda mengalami beberapa masalah yang mencegah fitur "add user" dan "add department" berfungsi dengan baik:

### 1. **Fungsi CRUD untuk Departments Tidak Lengkap**
- ❌ **Masalah**: `departmentsService` hanya memiliki fungsi `getAll()` dan `getById()`, tetapi tidak memiliki `create()`, `update()`, dan `delete()`
- ✅ **Solusi**: Menambahkan ketiga fungsi tersebut ke `departmentsService` di `src/supabase-service.ts`

### 2. **Import Path yang Salah**
- ❌ **Masalah**: `src/supabase-service.ts` mengimpor dari `'./supabase'` yang tidak ada
- ✅ **Solusi**: Mengubah import menjadi `'./lib/supabaseClient'` yang merupakan lokasi file yang benar

### 3. **Konfigurasi Supabase Localhost**
- ⚠️ **Catatan**: File `.env` menggunakan `http://localhost:54321` yang berarti Anda menggunakan Supabase lokal
- 🔧 **Opsi**:
  - Jalankan Supabase secara lokal dengan `supabase start`
  - ATAU ganti dengan URL dan key dari Supabase Cloud

---

## 🔧 Perbaikan yang Dilakukan

### A. Menambahkan Fungsi CRUD ke `departmentsService`

**File**: `src/supabase-service.ts` (baris 173-233)

```typescript
// Create new department
async create(department: { name: string }): Promise<Department> {
  const newId = department.name.toLowerCase().replace(/\s/g, '-');
  const { data, error } = await supabase
    .from('departments')
    .insert({ name: department.name, id: newId, employee_count: 0 })
    .select()
    .single()

  if (error) {
    console.error('Error creating department:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    employeeCount: data.employee_count
  }
},

// Update department
async update(id: string, updates: Partial<Department>): Promise<Department> {
  const updateData: any = {}
  if (updates.name) updateData.name = updates.name
  if (updates.employeeCount !== undefined) updateData.employee_count = updates.employeeCount

  const { data, error } = await supabase
    .from('departments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating department:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    employeeCount: data.employee_count
  }
},

// Delete department
async delete(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting department:', error)
    throw error
  }

  return true
}
```

### B. Memperbaiki Import Path

**File**: `src/supabase-service.ts` (baris 1)

**Sebelum:**
```typescript
import { supabase, convertUserFromDb, convertLeaveRequestFromDb, convertUserToDb, convertLeaveRequestToDb } from './supabase'
```

**Sesudah:**
```typescript
import { supabase, convertUserFromDb, convertLeaveRequestFromDb, convertUserToDb, convertLeaveRequestToDb } from './lib/supabaseClient'
```

---

## 📝 Cara Menggunakan Fitur Add Department

Fitur "Add Department" di halaman `/admin/departments` sekarang sudah berfungsi penuh:

### 1. **Menambah Department Baru**
- Klik tombol "Add Department"
- Masukkan nama department
- Klik "Add Department"
- Department akan disimpan ke Supabase dengan ID otomatis (nama lowercase dengan spasi diganti dash)

### 2. **Mengedit Department**
- Klik menu "..." pada department yang ingin diedit
- Pilih "Edit"
- Ubah nama department
- Klik "Save Changes"

### 3. **Menghapus Department**
- Klik menu "..." pada department yang ingin dihapus
- Pilih "Delete"
- Sistem akan mencegah penghapusan jika ada karyawan di department tersebut

---

## 📝 Cara Menggunakan Fitur Add User

Fitur "Add User" di halaman `/admin/users` sudah siap digunakan:

### 1. **Menambah User Baru**
- Klik tombol "Add User"
- Isi semua field yang diperlukan:
  - **Name**: Nama lengkap user
  - **NIP**: Nomor Induk Pegawai (harus unik)
  - **Password**: Password untuk login
  - **Phone**: Nomor telepon
  - **Gol. Ruang**: Golongan ruang
  - **Tgl. Masuk**: Tanggal masuk kerja
  - **Department**: Pilih department
  - **Role**: Admin atau Employee
  - **Annual Leave Balance**: Jumlah cuti tahunan (default: 12)
- Klik "Add User"

### 2. **Mengedit User**
- Klik menu "..." pada user yang ingin diedit
- Pilih "Edit"
- Ubah data yang diperlukan
- Klik "Save Changes"

### 3. **Menghapus User**
- Klik menu "..." pada user yang ingin dihapus
- Pilih "Delete"

---

## 🗄️ Struktur Database

### Tabel `departments`
```sql
CREATE TABLE departments (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabel `users`
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  nip VARCHAR(255) UNIQUE NOT NULL,
  avatar TEXT,
  department_id VARCHAR(255) NOT NULL REFERENCES departments(id),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Employee')),
  annual_leave_balance INTEGER DEFAULT 0,
  qr_code_signature TEXT,
  phone VARCHAR(50),
  bangsa VARCHAR(50),
  join_date TIMESTAMP WITH TIME ZONE,
  address TEXT,
  password VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Langkah-Langkah Setup

### 1. **Konfigurasi Supabase**

#### Opsi A: Menggunakan Supabase Cloud (Recommended)
1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Dapatkan URL dan Anon Key dari project settings
4. Update file `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

#### Opsi B: Menggunakan Supabase Lokal
1. Install Supabase CLI: `npm install -g supabase`
2. Jalankan: `supabase start`
3. Gunakan URL dan key dari output

### 2. **Setup Database**

Jalankan SQL schema dari file `database-schema.sql` di Supabase Dashboard:

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Buka "SQL Editor"
4. Buat query baru dan copy-paste seluruh isi `database-schema.sql`
5. Jalankan query

### 3. **Install Dependencies**

```bash
cd /home/ubuntu/project/app
npm install
# atau
pnpm install
```

### 4. **Jalankan Development Server**

```bash
npm run dev
# atau
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## ✅ Checklist Verifikasi

Setelah melakukan perbaikan, pastikan:

- [ ] File `src/supabase-service.ts` sudah diperbaiki dengan import path yang benar
- [ ] Fungsi `create()`, `update()`, dan `delete()` sudah ditambahkan ke `departmentsService`
- [ ] File `.env` sudah dikonfigurasi dengan Supabase URL dan key yang benar
- [ ] Database schema sudah dijalankan di Supabase
- [ ] Dependencies sudah diinstall
- [ ] Development server berjalan tanpa error
- [ ] Halaman `/admin/departments` dapat menambah, mengedit, dan menghapus department
- [ ] Halaman `/admin/users` dapat menambah, mengedit, dan menghapus user
- [ ] Data tersimpan di Supabase (bisa diverifikasi di Supabase Dashboard)

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- **Solusi**: Pastikan file `.env` memiliki `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Cannot find module './supabase'"
- **Solusi**: Sudah diperbaiki dengan mengubah import path menjadi `'./lib/supabaseClient'`

### Data tidak tersimpan ke Supabase
- **Solusi**: 
  - Pastikan Supabase URL dan key benar
  - Pastikan database schema sudah dijalankan
  - Periksa Row Level Security (RLS) policies di Supabase Dashboard

### Halaman Add Department/User tidak merespons
- **Solusi**:
  - Buka browser console (F12) dan cek error messages
  - Pastikan Supabase server berjalan
  - Cek network tab untuk melihat request yang gagal

---

## 📚 Referensi

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Terakhir diperbarui**: November 9, 2025
