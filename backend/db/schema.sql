CREATE TABLE IF NOT EXISTS `about_section` (
  `about_id` INT NOT NULL AUTO_INCREMENT,
  `about_title` VARCHAR(150) DEFAULT NULL,
  `about_description` TEXT,
  `about_page_url` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`about_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `contact_info` (
  `contact_id` INT NOT NULL AUTO_INCREMENT,
  `contact_address` VARCHAR(255) DEFAULT NULL,
  `contact_city` VARCHAR(100) DEFAULT NULL,
  `contact_state` VARCHAR(50) DEFAULT NULL,
  `contact_zipcode` VARCHAR(10) DEFAULT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `contact_email` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`contact_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `hero_section` (
  `hero_id` INT NOT NULL AUTO_INCREMENT,
  `hero_main_title` VARCHAR(150) DEFAULT NULL,
  `hero_subtitle` TEXT,
  `hero_button_text` VARCHAR(100) DEFAULT NULL,
  `hero_secondary_button_text` VARCHAR(255) DEFAULT NULL,
  `hero_image_url` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`hero_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `menu_categories` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_unique` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `menu_items` (
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `item_name` VARCHAR(100) NOT NULL,
  `item_description` TEXT,
  `item_price` DECIMAL(6, 2) DEFAULT NULL,
  `item_image_url` VARCHAR(255) DEFAULT NULL,
  `item_is_visible` TINYINT(1) DEFAULT '1',
  `category_id` INT DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`category_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `operating_hours` (
  `oh_id` INT NOT NULL AUTO_INCREMENT,
  `day_of_week` VARCHAR(15) DEFAULT NULL,
  `open_time` TIME DEFAULT NULL,
  `close_time` TIME DEFAULT NULL,
  `restaurant_is_closed` TINYINT(1) DEFAULT '0',
  PRIMARY KEY (`oh_id`),
  UNIQUE KEY `day_of_week` (`day_of_week`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `ordering_links` (
  `platform_id` INT NOT NULL AUTO_INCREMENT,
  `platform_name` VARCHAR(50) DEFAULT NULL,
  `platform_url` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`platform_id`),
  UNIQUE KEY `platform_name` (`platform_name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT NOT NULL,
  `footer_json` JSON NOT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `traffic_dates` (
  `date` DATE NOT NULL,
  `date_views` INT NOT NULL,
  PRIMARY KEY (`date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `traffic_pages` (
  `page` VARCHAR(255) NOT NULL,
  `page_views` INT NOT NULL,
  PRIMARY KEY (`page`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `traffic_visitors` (
  `visitor_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`visitor_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
INSERT INTO `site_settings` (`id`, `footer_json`)
VALUES (
    1,
    JSON_OBJECT(
      'contact',
      JSON_OBJECT(
        'phone',
        '(916) 754-2143',
        'address',
        '6175 Stockton Blvd #200',
        'cityZip',
        'Sacramento, CA 95824'
      ),
      'navLinks',
      JSON_ARRAY(
        JSON_OBJECT('path', '/', 'label', 'Home'),
        JSON_OBJECT('path', '/about', 'label', 'About'),
        JSON_OBJECT('path', '/menu', 'label', 'Menu'),
        JSON_OBJECT('path', '/contact', 'label', 'Contact'),
        JSON_OBJECT(
          'path',
          'https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200',
          'label',
          'Order',
          'external',
          TRUE
        )
      ),
      'socialLinks',
      JSON_ARRAY(
        JSON_OBJECT(
          'url',
          'https://instagram.com/',
          'icon',
          'instagram',
          'platform',
          'instagram'
        )
      )
    )
  ) ON DUPLICATE KEY
UPDATE `footer_json` =
VALUES(`footer_json`);