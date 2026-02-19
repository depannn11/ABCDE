
# Setup Database Supabase - XTE Premium

Silakan salin dan jalankan script SQL ini di **SQL Editor** pada dashboard Supabase Anda untuk membuat tabel yang dibutuhkan.

## 1. Tabel Admins
```sql
CREATE TABLE admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL, -- Di aplikasi ini menggunakan plain text/hash manual
  created_at timestamptz DEFAULT now()
);

-- Insert admin default (d11 / d11)
INSERT INTO admins (username, password_hash) 
VALUES ('d11', 'd11');
```

## 2. Tabel Apps (Layanan Premium)
```sql
CREATE TABLE apps (
  id text PRIMARY KEY, -- Menggunakan slug (contoh: alight-motion)
  name text NOT NULL,
  price integer NOT NULL,
  description text,
  image text,
  created_at timestamptz DEFAULT now()
);
```

## 3. Tabel Accounts (Stok Akun)
```sql
CREATE TABLE accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id text REFERENCES apps(id) ON DELETE CASCADE,
  email text NOT NULL,
  password text NOT NULL,
  status text DEFAULT 'available', -- 'available' or 'sold'
  created_at timestamptz DEFAULT now()
);
```

## 4. Tabel Orders (Transaksi)
```sql
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text UNIQUE NOT NULL,
  app_id text REFERENCES apps(id),
  quantity integer NOT NULL,
  total integer NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'settlement', 'expired'
  qr_url text,
  delivered_accounts text[], -- Array berisi email:pass yang diberikan
  created_at timestamptz DEFAULT now()
);
```

## 5. Tabel Tutorials
```sql
CREATE TABLE tutorials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text,
  created_at timestamptz DEFAULT now()
);
```

## Kebijakan Keamanan (RLS)
Untuk kemudahan pengembangan, Anda bisa mematikan RLS (Row Level Security) pada tabel-tabel tersebut atau menambahkan policy `Enable access for all users` jika ingin tetap aman.

```sql
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials DISABLE ROW LEVEL SECURITY;
```
