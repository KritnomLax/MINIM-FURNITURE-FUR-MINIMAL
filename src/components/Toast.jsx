import { motion } from 'framer-motion';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import './Toast.css';

const toastVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  show:   { opacity: 1, x: 0, scale: 1,   transition: { type: 'spring', stiffness: 380, damping: 28 } },
  exit:   { opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle size={20} className="toast-icon success" />,
    info:    <Info        size={20} className="toast-icon info"    />,
    error:   <AlertCircle size={20} className="toast-icon error"  />,
  };

  return (
    <motion.div
      className={`toast toast-${type}`}
      variants={toastVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
    >
      {icons[type] || icons.info}
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={onClose} aria-label="Close toast">
        <X size={16} />
      </button>
    </motion.div>
  );
}
