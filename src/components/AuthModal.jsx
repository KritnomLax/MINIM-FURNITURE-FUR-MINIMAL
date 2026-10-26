import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) return;
    
    setLoading(true);
    try {
      if (isRegister) {
        await register(formData.email, formData.password);
        addToast('สมัครสมาชิกสำเร็จเรียบร้อย! ระบบเข้าสู่ระบบให้อัตโนมัติ', 'success');
      } else {
        await login(formData.email, formData.password);
        addToast('ยินดีต้อนรับกลับเข้าสู่ระบบ!', 'success');
      }
      onClose();
    } catch (error) {
      console.error("Auth Error:", error);
      addToast(error.message || 'การยืนยันตัวตนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-backdrop" onClick={onClose} />
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose} disabled={loading} aria-label="ปิดหน้าต่าง">
          <X size={24} />
        </button>
        
        <h2>{isRegister ? 'สร้างบัญชีสมาชิกใหม่' : 'เข้าสู่ระบบ'}</h2>
        <p className="auth-subtitle">
          {isRegister ? 'สมัครสมาชิกเพื่อบันทึกแบบ 3D และติดตามคำสั่งซื้อของคุณ' : 'เข้าสู่ระบบเพื่อเข้าถึงแบบจำลองและจัดการคำสั่งซื้อ'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>อีเมล (Email)</label>
            <input 
              type="email" 
              required 
              disabled={loading}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน (Password)</label>
            <input 
              type="password" 
              required 
              disabled={loading}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              minLength="6"
              placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
            />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'กำลังประมวลผล...' : (isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isRegister ? 'มีบัญชีสมาชิกอยู่แล้วใช่ไหม?' : 'ยังไม่มีบัญชีสมาชิก?'}
            <button type="button" onClick={() => !loading && setIsRegister(!isRegister)}>
              {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกเลย'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
