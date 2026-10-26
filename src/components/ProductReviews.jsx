import React, { useState, useEffect, useRef } from 'react';
import { Star, Send, ImagePlus, X, Loader } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { handleImageError } from '../utils/imageUtils';
import './ProductReviews.css';

const BUCKET = 'review-photos';
const MAX_FILE_SIZE_MB = 5;

const Stars = ({ count, size = 14 }) =>
  [...Array(5)].map((_, i) => (
    <Star
      key={i}
      size={size}
      fill={i < count ? '#f59e0b' : 'none'}
      color={i < count ? '#f59e0b' : '#d1d5db'}
    />
  ));

const ReviewItem = ({ review }) => (
  <div className="review-item">
    <div className="review-header">
      <div className="reviewer-avatar">
        {review.user_email ? review.user_email.charAt(0).toUpperCase() : 'U'}
      </div>
      <div>
        <div className="reviewer-email">
          {review.user_email ? review.user_email.split('@')[0] : 'ลูกค้า'}
          <span className="review-date">
            {new Date(review.created_at).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <div className="review-stars">
          <Stars count={review.rating} />
        </div>
      </div>
    </div>

    <p className="review-text">{review.comment}</p>

    {review.photo_url && (
      <div className="review-photo-wrapper">
        <img
          src={review.photo_url}
          alt="ภาพถ่ายจากลูกค้ารีวิว"
          className="review-photo"
          loading="lazy"
          onClick={() => window.open(review.photo_url, '_blank')}
          title="คลิกเพื่อดูรูปภาพขนาดเต็ม"
          onError={handleImageError}
        />
      </div>
    )}
  </div>
);

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [rating, setRating]             = useState(5);
  const [comment, setComment]           = useState('');
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      addToast(`ขนาดไฟล์ภาพต้องไม่เกิน ${MAX_FILE_SIZE_MB} MB`, 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast('กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น', 'error');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { 
      addToast('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว', 'error'); 
      return; 
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      let photo_url = null;

      if (photoFile) {
        const ext  = photoFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, photoFile, { upsert: false });

        if (uploadError) throw new Error('ไม่สามารถอัปโหลดรูปภาพได้: ' + uploadError.message);

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path);

        photo_url = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert([{
          product_id: productId,
          user_id:    user.id,
          user_email: user.email,
          rating,
          comment,
          photo_url,
        }]);

      if (insertError) throw new Error(insertError.message);

      addToast('ส่งรีวิวสินค้าเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็น!', 'success');
      setComment('');
      setRating(5);
      clearPhoto();
      fetchReviews();

    } catch (err) {
      addToast('ข้อผิดพลาด: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h3 className="reviews-title">รีวิวจากผู้ใช้จริง</h3>
        {avgRating && (
          <div className="reviews-avg">
            <Stars count={Math.round(avgRating)} size={15} />
            <span className="avg-score">{avgRating}</span>
            <span className="avg-count">({reviews.length} ความคิดเห็น)</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-select">
          <span>ระดับความพึงพอใจ:</span>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="star-btn"
              aria-label={`${star} ดาว`}
            >
              <Star
                size={20}
                fill={star <= rating ? '#f59e0b' : 'none'}
                color={star <= rating ? '#f59e0b' : '#d1d5db'}
              />
            </button>
          ))}
        </div>

        <div className="comment-input-wrapper">
          <textarea
            placeholder={user ? 'เขียนรีวิวและแบ่งปันประสบการณ์ของคุณกับสินค้าชิ้นนี้...' : 'กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว'}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={!user || isSubmitting}
            required
            rows="2"
          />
          <button
            type="submit"
            className="submit-review-btn"
            disabled={!user || isSubmitting || !comment.trim()}
            title="ส่งรีวิว"
          >
            {isSubmitting ? <Loader size={16} className="spin-sm" /> : <Send size={16} />}
          </button>
        </div>

        {user && (
          <div className="photo-upload-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
              disabled={isSubmitting}
            />

            {photoPreview ? (
              <div className="photo-preview-wrap">
                <img src={photoPreview} alt="รูปตัวอย่าง" className="photo-preview" />
                <button
                  type="button"
                  className="photo-clear-btn"
                  onClick={clearPhoto}
                  disabled={isSubmitting}
                  title="ลบรูปภาพออก"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="photo-add-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <ImagePlus size={16} />
                แนบภาพถ่ายสินค้าจริง <span className="photo-limit">(ไม่เกิน {MAX_FILE_SIZE_MB} MB)</span>
              </button>
            )}
          </div>
        )}
      </form>

      <div className="reviews-list">
        {loading ? (
          <p className="reviews-empty">กำลังโหลดความคิดเห็น...</p>
        ) : reviews.length === 0 ? (
          <p className="reviews-empty">ยังไม่มีรีวิวสำหรับสินค้านี้ ร่วมเป็นคนแรกที่รีวิวเลย!</p>
        ) : (
          reviews.map(review => <ReviewItem key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
