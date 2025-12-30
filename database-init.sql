-- ============================================
-- MariaDB 초기화 SQL 스크립트
-- ejdc-wedding 프로젝트용
-- ============================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS ejdc_wedding 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE ejdc_wedding;

-- ============================================
-- 1. guestbook 테이블 (방명록)
-- ============================================
CREATE TABLE IF NOT EXISTS guestbook (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL DEFAULT NULL COMMENT '소프트 삭제용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. gallery 테이블 (갤러리 이미지)
-- ============================================
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL DEFAULT '' COMMENT '파일명 (예: images/main_cover.jpg)',
  image_type ENUM('main', 'gallery') DEFAULT 'gallery' COMMENT 'main: 메인 이미지, gallery: 갤러리 이미지',
  order_index INT NULL DEFAULT NULL COMMENT '갤러리 이미지 정렬 순서',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL DEFAULT NULL COMMENT '소프트 삭제용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. contacts 테이블 (연락처)
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  side ENUM('groom', 'bride') NOT NULL COMMENT 'groom: 신랑, bride: 신부',
  relationship ENUM('person', 'father', 'mother', 'brother', 'sister', 'other') NOT NULL COMMENT '관계',
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  bank_name VARCHAR(50) DEFAULT NULL COMMENT '은행명',
  account_number VARCHAR(50) DEFAULT NULL COMMENT '계좌번호',
  kakaopay_link VARCHAR(500) DEFAULT NULL COMMENT '카카오페이 링크',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. blessing_content 테이블 (축하 메시지)
-- ============================================
CREATE TABLE IF NOT EXISTS blessing_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content LONGTEXT NOT NULL COMMENT '축하 메시지 내용',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- blessing_content 기본 데이터 삽입
INSERT INTO blessing_content (content) VALUES (
  '하나님께서 인도하신 만남 속에서
서로의 깊은 존재를 알아가며
가장 진실한 사랑으로 하나 되고자 합니다.

소중한 분들을 모시고
그 첫걸음을 함께 나누고 싶습니다.
축복으로 함께해 주시면 감사하겠습니다.'
) ON DUPLICATE KEY UPDATE content = content;

-- ============================================
-- 5. admin 테이블 (관리자)
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '관리자 아이디',
  password VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- admin 계정 생성 (username: admin, password: ehcksdmswls123)
INSERT INTO admin (username, password) VALUES (
  'admin',
  '52d5815aec809b8952f41428dd3a9649:67117f54ca34236aac22e27ff50919874f0d7470bc3cafd0145fa28ae3143c8d85d1564f30a07f363c1c475f59b8c0d29056023c149c7829da3a7d76a229e4c8'
) ON DUPLICATE KEY UPDATE password = VALUES(password);

-- ============================================
-- 6. theme_settings 테이블 (테마 설정)
-- ============================================
CREATE TABLE IF NOT EXISTS theme_settings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  primary_bg VARCHAR(7) NOT NULL DEFAULT '#FFFEFB' COMMENT '기본 배경색',
  secondary_bg VARCHAR(7) NOT NULL DEFAULT '#E5E5E7' COMMENT '보조 배경색',
  section_bg VARCHAR(7) NOT NULL DEFAULT '#FFFEFD' COMMENT '섹션 배경색',
  accent_primary VARCHAR(7) NOT NULL DEFAULT '#F8DDE4' COMMENT '주요 강조색',
  accent_secondary VARCHAR(7) NOT NULL DEFAULT '#783BFF' COMMENT '보조 강조색',
  button_bg VARCHAR(7) NOT NULL DEFAULT '#111827' COMMENT '버튼 배경색',
  button_bg_hover VARCHAR(7) NOT NULL DEFAULT '#000000' COMMENT '버튼 호버 배경색',
  button_text VARCHAR(7) NOT NULL DEFAULT '#FFFFFF' COMMENT '버튼 텍스트 색상',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- theme_settings 기본 데이터 삽입
INSERT INTO theme_settings (
  primary_bg, secondary_bg, section_bg,
  accent_primary, accent_secondary,
  button_bg, button_bg_hover, button_text
) VALUES (
  '#FFFEFB', '#E5E5E7', '#FFFEFD',
  '#F8DDE4', '#783BFF',
  '#111827', '#000000', '#FFFFFF'
) ON DUPLICATE KEY UPDATE id = id;

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- guestbook 인덱스
CREATE INDEX idx_guestbook_deleted_at ON guestbook(deleted_at);
CREATE INDEX idx_guestbook_created_at ON guestbook(created_at);

-- gallery 인덱스
CREATE INDEX idx_gallery_image_type ON gallery(image_type);
CREATE INDEX idx_gallery_deleted_at ON gallery(deleted_at);
CREATE INDEX idx_gallery_order_index ON gallery(order_index);
CREATE INDEX idx_gallery_created_at ON gallery(created_at);

-- contacts 인덱스
CREATE INDEX idx_contacts_side ON contacts(side);
CREATE INDEX idx_contacts_relationship ON contacts(relationship);

-- ============================================
-- 완료 메시지
-- ============================================
SELECT 'Database initialization completed successfully!' AS message;

