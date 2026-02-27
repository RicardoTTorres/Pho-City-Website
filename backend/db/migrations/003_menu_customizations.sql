
CREATE TABLE IF NOT EXISTS category_customization_groups (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  enabled     TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_custgroup_category (category_id),
  CONSTRAINT fk_custgroup_cat
    FOREIGN KEY (category_id)
    REFERENCES menu_categories(category_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS customization_sections (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  title    VARCHAR(100) NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_section_group
    FOREIGN KEY (group_id)
    REFERENCES category_customization_groups(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS customization_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  name       VARCHAR(150) NOT NULL,
  price      VARCHAR(20) DEFAULT NULL,
  position   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_custitem_section
    FOREIGN KEY (section_id)
    REFERENCES customization_sections(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
