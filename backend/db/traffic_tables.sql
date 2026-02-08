/* PC-104 Traffic Analytics requires new SQL tables. */
/* These are also included in init.sql with the other tables. */;

DROP TABLE IF EXISTS `traffic_dates`;
CREATE TABLE `traffic_dates` (
  `date` DATE NOT NULL,
  `date_views` INT NOT NULL,
  PRIMARY KEY (`date`)
);

DROP TABLE IF EXISTS `traffic_pages`;
CREATE TABLE `traffic_pages` (
  `page` VARCHAR(255) NOT NULL,
  `page_views` INT NOT NULL,
  PRIMARY KEY (`page`)
);

DROP TABLE IF EXISTS `traffic_visitors`;
CREATE TABLE `traffic_visitors` (
    `visitor_id` CHAR(36) NOT NULL,
    PRIMARY KEY (`visitor_id`)
);