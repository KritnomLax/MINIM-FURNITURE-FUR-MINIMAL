# MINIM Furniture — Web Application
> เว็บแอปพลิเคชันสำหรับร้านเฟอร์นิเจอร์ไม้แท้สไตล์มินิมอลสั่งผลิต พร้อมระบบจำลองแบบ 3 มิติ (3D Interactive Customizer)

## ข้อมูลโครงงาน
- **วิชา:** 1145104-63 โครงงานวิทยาการข้อมูลและนวัตกรรมซอฟต์แวร์ 3
- **เทคโนโลยีหลัก:** React 19, Vite, Three.js, @react-three/fiber, Supabase, Framer Motion, Lucide Icons

---

## ฟังก์ชันหลักของระบบ (Features)
1. **Pure Solid Wood Catalog:** แสดงสินค้างานไม้แท้ 100% พร้อมระบบค้นหาและกรองตามหมวดหมู่ห้อง
2. **3D Furniture Customizer:** โมเดลจำลอง 3 มิติ 4 ประเภท (โต๊ะ, เก้าอี้, ตู้, ชั้นวาง) หมุน 360°, สลับสีเนื้อไม้, ปรับสัดส่วน และประเมินราคาเรียลไทม์
3. **Cart & Wishlist:** ระบบตะกร้าสินค้า และรายการโปรดที่บันทึกลงในระบบ
4. **Checkout System:** สั่งซื้อสินค้าพร้อมระบุข้อมูลจัดส่ง เลือกวิธีชำระเงิน (PromptPay, COD, Card) บันทึกผ่าน Supabase RPC แบบ Atomic Transaction
5. **Photo Reviews & Storage:** ระบบให้คะแนนรีวิว 1–5 ดาว พร้อมอัปโหลดรูปถ่ายจริงจากลูกค้าเข้าสู่ Supabase Storage
6. **Role-Based Access Control (Admin Dashboard):**
   - แอดมินจัดการสินค้า (เพิ่ม, ลบ, แก้ไข พร้อม Live Preview และ Presets)
   - แอดมินจัดการและเปลี่ยนสถานะคำสั่งซื้อของลูกค้า (Pending, Processing, Shipped, Delivered)

---

## สารบัญเอกสารประกอบโครงงาน (Project Documentation)
- [LASTESTPROCESS.md](LASTESTPROCESS.md) — รายงานความคืบหน้าภาพรวมโครงการเทียบกับแผนรายวิชาฉบับล่าสุด
- [Use_Case_Description_MINIM.md](Use_Case_Description_MINIM.md) — รายละเอียด Use Case Descriptions ทั้ง 12 เคส (สำหรับบทที่ 3)
- [DATABASE_MODELING_MINIM.md](DATABASE_MODELING_MINIM.md) — แผนผังฐานข้อมูล ER-Diagram และ Data Dictionary (สำหรับบทที่ 3)
- [CHAPTER_4_SYSTEM_IMPLEMENTATION.md](CHAPTER_4_SYSTEM_IMPLEMENTATION.md) — สถาปัตยกรรมและรายละเอียดการพัฒนาระบบ (สำหรับบทที่ 4)
- [CHAPTER_5_TESTING_AND_CONCLUSION.md](CHAPTER_5_TESTING_AND_CONCLUSION.md) — ผลการทดสอบ สรุปผลการพัฒนา และข้อเสนอแนะ (สำหรับบทที่ 5)
- [TEST_CHECKLIST_AND_DEMO.md](TEST_CHECKLIST_AND_DEMO.md) — ตาราง Test Cases (TC-01 ถึง TC-11) พร้อมบทและสคริปต์สาธิตระบบสำหรับสอบ

---

## การติดตั้งและรันโปรเจกต์ (Getting Started)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรันโปรเจกต์ในโหมดพัฒนา (Development)
npm run dev

# 3. ตรวจสอบการ Build สำหรับ Production
npm run build
```
