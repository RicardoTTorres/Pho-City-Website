DROP TABLE IF EXISTS `traffic_dates`;
CREATE TABLE `traffic_dates` (
    `date` DATE NOT NULL,
    `date_views` INT NOT NULL,
    PRIMARY KEY (`date`)
);
INSERT INTO `traffic_dates`
VALUES ("2025-11-10", 75);
INSERT INTO `traffic_dates`
VALUES ("2025-11-11", 120);
INSERT INTO `traffic_dates`
VALUES ("2025-11-12", 95);
INSERT INTO `traffic_dates`
VALUES ("2025-11-13", 180);
INSERT INTO `traffic_dates`
VALUES ("2025-11-14", 160);
INSERT INTO `traffic_dates`
VALUES ("2025-11-15", 130);
DROP TABLE IF EXISTS `traffic_pages`;
CREATE TABLE `traffic_pages` (
    `page` VARCHAR(255) NOT NULL,
    `page_views` INT NOT NULL,
    PRIMARY KEY (`page`)
);
INSERT INTO `traffic_pages`
VALUES ("/", 420);
INSERT INTO `traffic_pages`
VALUES ("/about", 180);
INSERT INTO `traffic_pages`
VALUES ("/contact", 110);
INSERT INTO `traffic_pages`
VALUES ("/menu", 500);
INSERT INTO `traffic_pages`
VALUES ("/stats", 38);
DROP TABLE IF EXISTS `traffic_visitors`;
CREATE TABLE `traffic_visitors` (
    `visitor_id` CHAR(36) NOT NULL,
    PRIMARY KEY (`visitor_id`)
);