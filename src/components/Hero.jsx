import React from 'react';
import { handleImageError } from '../utils/imageUtils';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            ยกระดับพื้นที่ <br />
            <span>ชีวิตสไตล์มินิมอล</span>
          </h1>
          <p className="hero-subtitle">
            ค้นพบคอลเลกชันเฟอร์นิเจอร์สั่งทำพิเศษ ออกแบบมาเพื่อบ้านยุคใหม่ เรียบง่าย สวยงาม ทนทาน และลงตัวกับทุกมุมห้องของคุณ
          </p>
          <div className="hero-actions">
            <a href="#products" className="btn-primary">เลือกชมสินค้า</a>
            <a href="#designer" className="btn-secondary" onClick={(e) => {
              // smooth trigger for designer if desired
            }}>ออกแบบด้วยตัวคุณเอง</a>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="image-decoration"></div>
          <img 
            src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80" 
            alt="เฟอร์นิเจอร์ไม้สไตล์มินิมอล" 
            className="hero-image"
            onError={handleImageError}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
