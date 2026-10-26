# Project Creation Log: Mini Furniture Store

**วันที่บันทึก (Date):** 10 กันยายน 2026
**เครื่องมือที่ใช้ (Tech Stack):** React, Vite, Vanilla CSS, lucide-react (สำหรับไอคอน), three.js & @react-three/fiber (สำหรับ 3D)

## สรุปภาพรวม (Overview)
โปรเจกต์นี้เริ่มต้นจากความต้องการสร้างเว็บไซต์ขายเฟอร์นิเจอร์แบบ Mini Project เพื่อฆ่าเวลา โดยเน้นให้ดีไซน์ออกมามีความหรูหรา (Premium Aesthetics) และมีลูกเล่น Animation เล็กๆ น้อยๆ เพื่อเพิ่มความน่าสนใจให้กับตัวเว็บไซต์ (Dynamic Design) ล่าสุดได้ยกระดับเป็น Ultimate E-Commerce ด้วยระบบ 3D Designer แบบ Real-time

## ขั้นตอนการพัฒนา (Development Steps)

### 1. โครงสร้างพื้นฐาน (Setup & Foundation)
- เริ่มต้นโปรเจกต์ด้วยคำสั่ง `npm create vite@latest` พร้อมเลือก Template แบบ React
- ติดตั้ง `lucide-react` เพื่อใช้งานไอคอนแบบ Minimalist
- ลบไฟล์ CSS เดิมทิ้งทั้งหมดแล้วเขียน `index.css` ใหม่ โดยวางระบบ Design System ซึ่งประกอบด้วย:
  - **Color Palette:** โทนสี Earth Tones (สีครีม ขาวสว่าง เทาเข้ม) ผสมสี Accent เป็นสีน้ำตาลทอง/ไม้ เพื่อให้เข้ากับธีมเฟอร์นิเจอร์
  - **Typography:** เลือกใช้ฟอนต์ Outfit จาก Google Fonts เพื่อให้ได้อารมณ์คลีนและทันสมัย
  - **CSS Variables:** กำหนดตัวแปรสำหรับสี, เงา (Shadow), ความโค้งมน (Border Radius) และการเคลื่อนไหว (Transitions) เพื่อให้นำไปใช้ต่อได้ง่าย

### 2. การสร้าง Component หลัก และ E-Commerce Logic
- **`CartContext.jsx`, `ThemeContext.jsx`, `WishlistContext.jsx`, `ToastContext.jsx`:** สร้าง Global State จัดการตะกร้า, โหมดมืดสว่าง, รายการโปรด และป๊อปอัปแจ้งเตือน
- **`Navbar.jsx`:** เมนูบาร์ด้านบนที่มีระบบ Glassmorphism พร้อมปุ่ม Profile, Theme, Wishlist และ Cart
- **`Hero.jsx`:** รูปภาพและข้อความต้อนรับด้านบนสุด ตกแต่งด้วยแอนิเมชัน
- **`ProductList.jsx` & `ProductCard.jsx`:** รองรับการ Filter/Sort สินค้า และกดดู Quick View หรือกด Add to Wishlist
- **`CartModal.jsx` & `CheckoutModal.jsx`:** ระบบจัดการตะกร้าสินค้าและการจำลองฟอร์มชำระเงินที่สมบูรณ์

### 3. ระบบ 3D Custom Furniture Designer (Phase 1)
- **`Designer.jsx` & `FurnitureModel.jsx`:** สร้างหน้าจอ 3D Canvas ด้วย `@react-three/fiber` ที่ผู้ใช้สามารถหมุนดูโมเดลโต๊ะ 3D ได้ 360 องศา
- **`DesignerControls.jsx`:** แถบควบคุมให้ผู้ใช้ปรับขนาด (กว้าง/ลึก) และสลับสีวัสดุไม้ได้แบบ Real-time พร้อมคำนวณราคาใหม่ทันที
- **`AuthContext.jsx` & `UserProfile.jsx`:** สร้างระบบจำลองบัญชีผู้ใช้ (Mock Auth ด้วย LocalStorage) ให้ผู้ใช้ล็อกอินและกด "Save Design" แบบ 3D ของตัวเองเก็บไว้ในโปรไฟล์ได้
- **AR Preview (Mock):** เพิ่มปุ่ม View in AR ที่แสดง QR Code จำลองการนำโมเดลไปสแกนดูผ่านมือถือ

### 4. การส่งมอบและการจัดการโค้ด
- ยกเลิกการ Push ขึ้น GitHub เนื่องจากติดปัญหาการ Authentication ใน Terminal
- แปลงไฟล์โปรเจกต์ทั้งหมดให้อยู่ในรูปแบบไฟล์ `.zip` (ชื่อ `mini_project.zip`) ไว้ในโฟลเดอร์ให้เรียบร้อยเพื่อความสะดวกในการส่งมอบ

## สถานะปัจจุบัน
- โปรเจกต์เสร็จสมบูรณ์ในระดับ Front-end UI ครบถ้วน (รวมถึงฟีเจอร์พรีเมียม 3D)
- สามารถรันดูการทำงานจริงด้วยคำสั่ง `npm run dev`

## ไอเดียสำหรับฟีเจอร์ในอนาคต (Future Ideas)
- **Photo Reviews & Community Gallery:** ระบบรีวิวสินค้าที่ผู้ใช้สามารถอัปโหลดรูปภาพได้
- **AI Furniture Recommendations:** นำรูปภาพห้องมาให้ AI แนะนำเฟอร์นิเจอร์ที่เข้ากัน
- **Interactive Room Planner:** ยกระดับจากการแต่งโต๊ะ 1 ตัว เป็นการวางเฟอร์นิเจอร์หลายๆ ชิ้นในห้อง 3D พร้อมกัน
