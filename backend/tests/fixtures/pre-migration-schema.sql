-- Immediate pre-migration drift fixture. Disposable integration databases only.
CREATE TABLE about_section (
  about_id INT NOT NULL AUTO_INCREMENT,
  about_title VARCHAR(150) DEFAULT NULL,
  about_description TEXT,
  about_page_url VARCHAR(255) DEFAULT NULL,
  about_image_url VARCHAR(512) DEFAULT NULL,
  PRIMARY KEY (about_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO about_section
  (about_id, about_title, about_description, about_image_url)
VALUES (1, 'Legacy About', 'Legacy body', 'legacy-about.jpg');

CREATE TABLE about_page_content (
  id INT NOT NULL AUTO_INCREMENT,
  hero_title VARCHAR(150) DEFAULT NULL,
  hero_intro TEXT,
  hero_image_url VARCHAR(512) DEFAULT NULL,
  beginning_title VARCHAR(150) DEFAULT NULL,
  beginning_body TEXT,
  food_title VARCHAR(150) DEFAULT NULL,
  food_body TEXT,
  commitment_title VARCHAR(150) DEFAULT NULL,
  commitment_body TEXT,
  closing_text TEXT,
  preview_heading VARCHAR(150) DEFAULT NULL,
  preview_body TEXT,
  preview_button_label VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO about_page_content
  (id, hero_title, hero_intro, beginning_title, food_title, commitment_title)
VALUES (1, 'Preserve Me', 'Existing intro', 'Start', 'Food', 'Promise');

CREATE TABLE menu_categories (
  category_id INT NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (category_id),
  UNIQUE KEY category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO menu_categories (category_id, category_name)
VALUES (7, 'Existing Category');

CREATE TABLE menu_items (
  item_id INT NOT NULL AUTO_INCREMENT,
  item_name VARCHAR(100) NOT NULL,
  item_description TEXT,
  item_price DECIMAL(6,2) DEFAULT NULL,
  item_image_url VARCHAR(512) DEFAULT NULL,
  item_is_visible TINYINT(1) DEFAULT 1,
  category_id INT DEFAULT NULL,
  is_featured TINYINT(1) DEFAULT 0,
  featured_position TINYINT DEFAULT NULL,
  PRIMARY KEY (item_id),
  KEY category_id (category_id),
  CONSTRAINT menu_items_ibfk_1 FOREIGN KEY (category_id)
    REFERENCES menu_categories (category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO menu_items
  (item_id, item_name, item_price, item_is_visible, category_id)
VALUES (42, 'Preserved Item', 9.50, 1, 7);

CREATE TABLE gmail_threads (
  email VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255) NOT NULL,
  history_id INT,
  PRIMARY KEY (email, thread_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO gmail_threads VALUES ('cache@example.test', 'thread-1', 2147483647);

CREATE TABLE gmail_messages (
  email VARCHAR(255) NOT NULL,
  message_id VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255),
  history_id INT,
  is_preview BOOLEAN NOT NULL,
  is_unread BOOLEAN NOT NULL,
  snippet TEXT,
  body TEXT,
  date DATETIME,
  subject TEXT,
  from_name TEXT,
  from_email VARCHAR(255),
  PRIMARY KEY (email, message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO gmail_messages
  (email, message_id, thread_id, history_id, is_preview, is_unread, date)
VALUES
  ('cache@example.test', 'message-1', 'thread-1', 2147483647, 1, 1, '2026-01-01');
