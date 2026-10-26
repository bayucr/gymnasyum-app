-- 1. Tabel Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  segment VARCHAR CHECK (segment IN ('Ibu-ibu', 'Lansia', 'Umum')),
  status VARCHAR DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  attendance_rate FLOAT DEFAULT 1.0,
  cancellation_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name VARCHAR NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  quota INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Reminder Logs
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Sent', 'Responded', 'No Response')),
  priority VARCHAR DEFAULT 'Low' CHECK (priority IN ('Low', 'Medium', 'High')),
  draft_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Data Dummy Awal
INSERT INTO customers (name, phone, segment, status, attendance_rate, cancellation_count) 
VALUES 
  ('Siti Rahma', '6281234567890', 'Ibu-ibu', 'Active', 0.35, 6),
  ('Budi Santoso', '6289876543210', 'Umum', 'Active', 0.85, 1);

INSERT INTO schedules (class_name, datetime, quota) 
VALUES 
  ('Zumba Sore', NOW() + INTERVAL '2 hours', 15),
  ('Yoga Pagi', NOW() + INTERVAL '1 day', 10);