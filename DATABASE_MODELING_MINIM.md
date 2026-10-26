# บทที่ 3 — การออกแบบฐานข้อมูล (Database Modeling & ER Diagram)
### โครงงาน: MINIM Furniture — Minimalist Furniture E-Commerce with 3D Customizer

---

## 1. ผังความสัมพันธ์ข้อมูล (Entity-Relationship Diagram: ERD)

```mermaid
erDiagram
    AUTH_USERS ||--o{ ORDERS : "places"
    AUTH_USERS ||--o{ SAVED_DESIGNS : "creates"
    AUTH_USERS ||--o{ REVIEWS : "writes"
    
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ SAVED_DESIGNS : "base model for"
    PRODUCTS ||--o{ REVIEWS : "receives"

    AUTH_USERS {
        uuid id PK "Supabase Auth UID"
        text email "User Email"
        jsonb raw_app_meta_data "Role: admin/customer"
    }

    PRODUCTS {
        serial id PK
        text name "Product Title"
        text category "Living Room / Bedroom / Office"
        numeric price "Unit Price (USD)"
        numeric width "Width in units (1 unit = 10 cm)"
        numeric depth "Depth in units (1 unit = 10 cm)"
        text image_url "Product Cover Image URL"
        timestamptz created_at
    }

    ORDERS {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "References auth.users(id)"
        numeric total_price "Total order amount"
        text status "pending / processing / shipped / delivered / cancelled"
        text shipping_name "Recipient Full Name"
        text shipping_address "Delivery Destination Address"
        text shipping_phone "Recipient Contact Number"
        timestamptz created_at
    }

    ORDER_ITEMS {
        uuid id PK "gen_random_uuid()"
        uuid order_id FK "References orders(id) ON DELETE CASCADE"
        integer product_id FK "References products(id)"
        text product_name "Snapshot of Product Name"
        integer quantity "Quantity purchased"
        numeric price "Snapshot of Unit Price"
    }

    SAVED_DESIGNS {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "References auth.users(id) ON DELETE CASCADE"
        text furniture_type "table / chair / sofa / shelf"
        text color "Hex Color Code"
        text color_name "Wood/Finish Label"
        numeric width "Custom Width"
        numeric depth "Custom Depth"
        numeric height "Custom Height"
        integer product_id FK "Nullable reference to base products(id)"
        timestamptz created_at
    }

    REVIEWS {
        uuid id PK "gen_random_uuid()"
        integer product_id FK "References products(id) ON DELETE CASCADE"
        uuid user_id FK "References auth.users(id) ON DELETE CASCADE"
        text user_email "Reviewer Email for Display"
        smallint rating "Score between 1 to 5"
        text comment "Customer Feedback"
        text photo_url "Supabase Storage Public URL"
        timestamptz created_at
    }
```

---

## 2. พจนานุกรมข้อมูล (Data Dictionary)

### 2.1 ตาราง `products` (สินค้า)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | คีย์ (Key) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | SERIAL | PK | รหัสสินค้าประจำรายการ |
| `name` | TEXT | | ชื่อสินค้า |
| `category` | TEXT | | หมวดหมู่สินค้า (เช่น Living Room, Bedroom, Office) |
| `price` | NUMERIC(10,2) | | ราคาสินค้า |
| `width` | NUMERIC | | ความกว้างของสินค้า (สเกล 1 หน่วย = 10 ซม.) |
| `depth` | NUMERIC | | ความลึกของสินค้า (สเกล 1 หน่วย = 10 ซม.) |
| `image_url` | TEXT | | ลิงก์ URL รูปภาพสินค้า |
| `created_at` | TIMESTAMPTZ | | วันที่และเวลาที่เพิ่มสินค้า |

### 2.2 ตาราง `orders` (คำสั่งซื้อ)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | คีย์ (Key) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | UUID | PK | รหัสประจำคำสั่งซื้อ (Auto gen_random_uuid) |
| `user_id` | UUID | FK | รหัสผู้สั่งซื้อ เชื่อมโยงกับ `auth.users(id)` |
| `total_price` | NUMERIC(10,2) | | ยอดรวมของคำสั่งซื้อ |
| `status` | TEXT | | สถานะ: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| `shipping_name`| TEXT | | ชื่อ-นามสกุล ผู้รับพัสดุ |
| `shipping_address`| TEXT | | ที่อยู่จัดส่ง |
| `shipping_phone`| TEXT | | หมายเลขโทรศัพท์ติดต่อ |
| `created_at` | TIMESTAMPTZ | | วันที่และเวลาที่สั่งซื้อ |

### 2.3 ตาราง `order_items` (รายการสินค้าในคำสั่งซื้อ)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | คีย์ (Key) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | UUID | PK | รหัสรายการสินค้าในออร์เดอร์ |
| `order_id` | UUID | FK | รหัสออร์เดอร์ เชื่อมโยง `orders(id)` (ON DELETE CASCADE) |
| `product_id` | INTEGER | FK | รหัสสินค้า เชื่อมโยง `products(id)` (Nullable สำหรับ custom) |
| `product_name`| TEXT | | ชื่อสินค้า ณ เวลาสั่งซื้อ (Snapshot ป้องกันการเปลี่ยนแปลงชื่อภายหลัง) |
| `quantity` | INTEGER | | จำนวนชิ้นที่สั่งซื้อ |
| `price` | NUMERIC(10,2) | | ราคาต่อหน่วย ณ เวลาสั่งซื้อ |

### 2.4 ตาราง `saved_designs` (แบบ 3D ที่บันทึกไว้)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | คีย์ (Key) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | UUID | PK | รหัสประจำแบบจำลอง |
| `user_id` | UUID | FK | รหัสผู้ใช้เจ้าของแบบ เชื่อม `auth.users(id)` |
| `furniture_type`| TEXT | | ประเภทของเฟอร์นิเจอร์ (เช่น table, chair) |
| `color` | TEXT | | รหัสสี Hex ของวัสดุ |
| `color_name` | TEXT | | ชื่อเรียกของเฉดสี/เนื้อไม้ (เช่น Natural Oak) |
| `width` | NUMERIC | | ค่าความกว้างที่กำหนดเอง |
| `depth` | NUMERIC | | ค่าความลึกที่กำหนดเอง |
| `height` | NUMERIC | | ค่าความสูงที่กำหนดเอง |
| `product_id` | INTEGER | FK | รหัสสินค้าอ้างอิงต้นแบบ (ถ้ามี) |
| `created_at` | TIMESTAMPTZ | | วันที่และเวลาที่บันทึก |

### 2.5 ตาราง `reviews` (รีวิวสินค้า)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | คีย์ (Key) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | UUID | PK | รหัสรีวิว |
| `product_id` | INTEGER | FK | รหัสสินค้าที่ถูกรีวิว เชื่อม `products(id)` |
| `user_id` | UUID | FK | รหัสผู้เขียนรีวิว เชื่อม `auth.users(id)` |
| `user_email` | TEXT | | อีเมลผู้เขียนรีวิว (ใช้สำหรับแสดงผลผู้รีวิว) |
| `rating` | SMALLINT | | คะแนนดาว (1 - 5) |
| `comment` | TEXT | | ข้อความรีวิว |
| `photo_url` | TEXT | | URL รูปภาพประกอบรีวิว (เก็บบน Supabase Storage: `review-photos`) |
| `created_at` | TIMESTAMPTZ | | วันที่และเวลาที่ส่งรีวิว |

---

## 3. Storage Buckets (Supabase Storage)

| ชื่อ Bucket | สิทธิ์การเข้าถึง | วัตถุประสงค์ |
|---|---|---|
| `review-photos` | Public Read / Authenticated Upload | จัดเก็บภาพถ่ายสินค้าจริงจากลูกค้ารีวิว ขนาดไม่เกิน 5 MB |
