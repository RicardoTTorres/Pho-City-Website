CREATE TABLE IF NOT EXISTS footer_section (
  footer_id INT NOT NULL,
  brand_name VARCHAR(150) NOT NULL DEFAULT '',
  brand_logo VARCHAR(255) NOT NULL DEFAULT '',
  instagram_url VARCHAR(255) NOT NULL DEFAULT '',
  instagram_icon VARCHAR(255) NOT NULL DEFAULT '',
  contact_address VARCHAR(255) NOT NULL DEFAULT '',
  contact_city_zip VARCHAR(100) NOT NULL DEFAULT '',
  contact_phone VARCHAR(50) NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (footer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS footer_links (
  id INT NOT NULL AUTO_INCREMENT,
  footer_id INT NOT NULL,
  label VARCHAR(150) NOT NULL DEFAULT '',
  path VARCHAR(255) NOT NULL DEFAULT '',
  external TINYINT(1) NOT NULL DEFAULT 0,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY footer_id (footer_id),
  CONSTRAINT footer_links_ibfk_1 FOREIGN KEY (footer_id)
    REFERENCES footer_section (footer_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO footer_section (
  footer_id,
  brand_name,
  brand_logo,
  instagram_url,
  instagram_icon,
  contact_address,
  contact_city_zip,
  contact_phone
) VALUES (
  1,
  '',
  '',
  '',
  '',
  '',
  '',
  ''
);
