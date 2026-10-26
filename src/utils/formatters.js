// Helper สำหรับแปลงตัวเลขเป็นสกุลเงินบาท (฿)
export const formatPrice = (price) => {
  const num = Number(price) || 0;
  // แปลงอัตราเรต 1 USD ≈ 35 THB หรือใช้ตัวเลขเป็นบาทโดยตรง
  // เพื่อความสมจริงของราคาเฟอร์นิเจอร์ เช่น $180 -> ฿6,300 หรือคูณ 35
  const thb = Math.round(num * 35);
  return `฿${thb.toLocaleString('th-TH')}`;
};

// สกุลเงินบาทโดยตรง (กรณีที่ตัวเลขเป็นบาทอยู่แล้ว)
export const formatBaht = (amount) => {
  const num = Number(amount) || 0;
  return `฿${num.toLocaleString('th-TH')}`;
};
