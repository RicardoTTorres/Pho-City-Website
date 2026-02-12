-- Minimal, backward-compatible migration for admin users.
-- Creates the table only if it does not exist.
CREATE TABLE IF NOT EXISTS `admin_users` (
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`email`)
);

-- Seed a placeholder row only if the table is empty.
INSERT INTO `admin_users` (`email`, `password`)
SELECT * FROM (SELECT 'testemail' AS email, 'testpassword' AS password) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `admin_users` LIMIT 1);
