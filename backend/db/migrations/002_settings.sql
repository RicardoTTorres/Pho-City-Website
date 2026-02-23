-- Migration: 002_settings
-- Adds settings_json column to site_settings and creates contact_submissions table.

-- Add settings column (nullable for backward compatibility)
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS settings_json JSON NULL;

-- Seed default settings for the single-row config (id = 1)
UPDATE site_settings
SET settings_json = JSON_OBJECT(
  'site', JSON_OBJECT(
    'siteName',        'Pho City',
    'tagline',         'Authentic Vietnamese Cuisine',
    'seoDescription',  'Experience authentic Vietnamese flavors in Sacramento. Traditional pho, fresh rolls, and modern Vietnamese food.',
    'googleAnalyticsId', ''
  ),
  'contact', JSON_OBJECT(
    'notificationEmail',          '',
    'emailNotificationsEnabled',  FALSE,
    'storeSubmissions',           TRUE
  ),
  'pdf', JSON_OBJECT(
    'menuLabel',       'Download Menu',
    'cacheTtlMinutes', 60
  )
)
WHERE id = 1;

-- Contact message inbox
CREATE TABLE IF NOT EXISTS contact_submissions (
  id            INT NOT NULL AUTO_INCREMENT,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  message       TEXT NOT NULL,
  submitted_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read       TINYINT(1) NOT NULL DEFAULT 0,
  ip_hash       VARCHAR(64) NULL,
  PRIMARY KEY (id),
  KEY idx_submitted_at (submitted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
