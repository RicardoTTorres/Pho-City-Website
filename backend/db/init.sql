CREATE DATABASE  IF NOT EXISTS `pho_city_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pho_city_db`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: pho_city_db
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about_section`
--

DROP TABLE IF EXISTS `about_section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_section` (
  `about_id` int NOT NULL AUTO_INCREMENT,
  `about_title` varchar(150) DEFAULT NULL,
  `about_description` text,
  `about_page_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`about_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_section`
--

LOCK TABLES `about_section` WRITE;
/*!40000 ALTER TABLE `about_section` DISABLE KEYS */;
INSERT INTO `about_section` VALUES (1,'Pho City: Where Vietnamese Cuisine Transcends Expectations!','Welcome to Pho City, Sacramento\'s go-to destination for authentic Vietnamese flavors! We proudly serve a wide range of dishes, with dine-in, takeout, and delivery options to fit your lifestyle. Our menu also features vegan and vegetarian choices, ensuring something for everyone. Pho City, every dish is crafted with tradition, passion, and care. Join us and experience Vietnamese cuisine that truly transcends expectations.',NULL);
/*!40000 ALTER TABLE `about_section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_info`
--

DROP TABLE IF EXISTS `contact_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_info` (
  `contact_id` int NOT NULL AUTO_INCREMENT,
  `contact_address` varchar(255) DEFAULT NULL,
  `contact_city` varchar(100) DEFAULT NULL,
  `contact_state` varchar(50) DEFAULT NULL,
  `contact_zipcode` varchar(10) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`contact_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_info`
--

LOCK TABLES `contact_info` WRITE;
/*!40000 ALTER TABLE `contact_info` DISABLE KEYS */;
INSERT INTO `contact_info` VALUES (1,'6175 Stockton Blvd #200','Sacramento','CA','95824','(916) 754-2143','info@phocity.com');
/*!40000 ALTER TABLE `contact_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_section`
--

DROP TABLE IF EXISTS `hero_section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_section` (
  `hero_id` int NOT NULL AUTO_INCREMENT,
  `hero_main_title` varchar(150) DEFAULT NULL,
  `hero_subtitle` text,
  `hero_button_text` varchar(100) DEFAULT NULL,
  `hero_image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hero_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_section`
--

LOCK TABLES `hero_section` WRITE;
/*!40000 ALTER TABLE `hero_section` DISABLE KEYS */;
INSERT INTO `hero_section` VALUES (1,'Authentic Vietnamese Cuisine','Experience authentic Vietnamese flavors in the heart of Sacramento. From traditional pho to modern Vietnamese fusion, every dish is crafted with passion and tradition.','View Our Menu',NULL);
/*!40000 ALTER TABLE `hero_section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_categories`
--

DROP TABLE IF EXISTS `menu_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_categories`
--

LOCK TABLES `menu_categories` WRITE;
/*!40000 ALTER TABLE `menu_categories` DISABLE KEYS */;
INSERT INTO `menu_categories` VALUES (11,'Ala Carte'),(3,'Appetizers'),(5,'Bun Rieu'),(13,'Dessert'),(2,'Pho'),(4,'Porridge'),(7,'Rice Noodle/Egg Noodle Soup'),(8,'Rice Plates'),(12,'Shakes'),(6,'Spicy Beef Noodle Soup'),(9,'Stir Fry'),(10,'Vermicelli'),(1,'Vietnamese Sandwiches');
/*!40000 ALTER TABLE `menu_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`email`)
);

INSERT INTO `admin_users` VALUES ("testemail", "testpassword");

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `item_description` text,
  `item_price` decimal(6,2) DEFAULT NULL,
  `item_image_url` varchar(255) DEFAULT NULL,
  `item_is_visible` tinyint(1) DEFAULT '1',
  `category_id` int DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,'Grilled Pork Sandwich - Banh Mi Thit Nuong','Grilled Pork Sandwich crafted with Butter, Pate, Pickled Carrots, Pickled Cucumbers, Cilantro & Jalapenos',9.00,'',1,1,0),(2,'Grilled Chicken Sandwich - Banh Mi Ga Nuong','Grilled Chicken Sandwich crafted with Butter, Pate, Pickled Carrots, Pickled Cucumbers, Cilantro & Jalapenos',9.00,'',1,1,0),(3,'Grilled Beef Sandwich - Banh Mi Bo Nuong','Grilled Beef Sandwich crafted with Butter, Pate, Pickled Carrots, Pickled Cucumbers, Cilantro & Jalapenos',9.00,'',1,1,0),(4,'Vietnamese Ham Sandwich - Banh Mi Cha Lua','Vietnamese Ham Sandwich crafted with Butter, Pate, Pickled Carrots, Pickled Cucumbers, Cilantro & Jalapenos',9.00,'',1,1,0),(5,'Beef Stew with French Bread Loaf - Banh Mi Bo Kho','Stewed Flank Steak in a Sweet and Savory Thickened Beef Broth with Carrots, Onions, and Cilantro',15.00,'',1,1,0),(6,'[Pho DB] Dac Biet Special','Our Special Beef Noodle Soup with Rare Steak, Beef Meatball, Brisket, Flank, Tendon & Tripe. The original noodles for this Soup is “Rice Noodles”.',15.00,'',1,2,1),(7,'[C.N.G.G.S] Flank, Skirt Flank, Brisket, Tendon, & Tripe','Beef Noodle Soup with Flank, Skirt Flank, Brisket, Tendon & Tripe',15.00,'',1,2,1),(8,'[T.G.G.S] Rare Steak, Brisket, Tendon, & Tripe','Beef Noodle Soup with Rare Steak, Brisket, Tendon & Tripe',15.00,'',1,2,1),(9,'[T.N.G.S] Rare Steak, Flank, Tendon & Tripe','Beef Noodle Soup with Rare Steak, Flank, Tendon & Tripe',15.00,'',1,2,1),(10,'[T.N.Gan] Rare Steak, Flank, Tendon','Beef Noodle Soup with Rare Steak, Flank & Tendon',15.00,'',1,2,0),(11,'[T.N.S] Rare Steak, Flank & Tripe','Beef Noodle Soup with Rare Steak, Flank & Tripe',15.00,'',1,2,0),(12,'[NVD] Skirt Flank','Beef Noodle Soup with Skirt Flank',15.00,'',1,2,0),(13,'[T.NVD] Rare Steak & Skirt Flank','Beef Noodle Soup with Rare Steak & Skirt Flank',15.00,'',1,2,0),(14,'[T.Gau] Rare Steak & Brisket','Beef Noodle Soup with Rare Steak & Brisket',15.00,'',1,2,0),(15,'[T.N] Rare Steak & Flank','Beef Noodle Soup with Rare Steak & Flank',15.00,'',1,2,0),(16,'[T.BV] Rare Steak & Beef Meatball','Beef Noodle Soup with Rare Steak & Beef Meatball',15.00,'',1,2,0),(17,'[T.S] Rare Steak & Tripe','Beef Noodle Soup with Rare Steak & Tripe',15.00,'',1,2,0),(18,'[Pho Tai] Rare Steak','Beef Noodle Soup with Rare Steak',15.00,'',1,2,0),(19,'[Pho BV] Beef Meatball','Beef Noodle Soup with Beef Meatball',15.00,'',1,2,0),(20,'[Pho Bo Kho] Beef Stew','Beef Stew Noodle Soup with cuts of Braised Flank Steak, Bok Choy, and Carrots',15.00,'',1,2,0),(21,'[Pho Ga] Chicken','Chicken Noodle Soup',15.00,'',1,2,0),(22,'[Pho Gau] Brisket','Beef Noodle Soup with Brisket',15.00,'',1,2,0),(23,'[T.N.Gau] Rare Steak, Flank, & Brisket','Beef Noodle Soup with Rare Steak, Flank & Brisket',15.00,'',1,2,0),(24,'[Goi Cuon] Pork & Shrimp Spring Rolls (2)','Rice Paper Rolls filled with Boiled Pork Belly, Shrimp, Vermicelli Noodles & Green Leaf Vegetables',9.00,'',1,3,0),(25,'[Goi CuonTomTN] Grilled Pork & Shrimp Spring Rolls (2)','Rice Paper Rolls filled with Grilled Pork, Shrimp, Vermicelli Noodles & Green Leaf Vegetables',9.00,'',1,3,0),(26,'[Cha Gio] Egg Rolls (3)','Made with Ground Pork, Carrot, and Mushrooms',9.00,'',1,3,0),(27,'[Tom Chien] Fried Prawns (8)',NULL,13.00,'',1,3,0),(28,'[Tom Chien Dua] Fried Coconut Shrimp (8)',NULL,13.00,'',1,3,0),(29,'[Muc Chien] Fried Calamari','Fried Calamari with Sweet & Sour Dipping Sauce',15.00,'',1,3,0),(30,'[Muc Rang Muoi] Salt and Pepper Fried Calamari','Lightly Breaded Calamari Fried and tossed with Onions, Bell Peppers & Jalapenos',15.00,'',1,3,0),(31,'[Chem Chep] Grilled Mussels','Grilled Mussels Topped with Green Onion and Crushed Peanuts (10)',19.00,'',1,3,0),(32,'[Canh Ga Chien] Fried Chicken Wings (8)','Fried Chicken Wings with Sweet & Sour Dipping Sauce',13.00,'',1,3,0),(33,'[Canh Ga Rang Muoi] Salt and Pepper Fried Chicken Wings (8)','Lightly Breaded Chicken Wings Fried and tossed with Onions, Bell Peppers & Jalapenos',13.00,'',1,3,0),(34,'[So Diep] Grilled Scallops (10)','Grilled Scallops Topped with Green Onions and Peanuts (10)',19.00,'',1,3,0),(35,'[Goi Cuon Thit Heo] Pork Spring Rolls (2)','Rice Paper Rolls filled with Boiled Pork, Vermicelli Noodles & Green Leaf Vegetables',9.00,'',1,3,0),(36,'[Goi Cuon Tom Thit Nuong] Grilled Pork Spring Rolls (2)','Rice Paper Rolls filled with Grilled Pork, Vermicelli Noodles & Green Leaf Vegetables',9.00,'',1,3,0),(37,'[Goi Cuon Ga Nuong] Grilled Chicken Spring Rolls (2)','Rice Paper Rolls filled with Grilled Chicken, Vermicelli Noodles & Green Leaf Vegetables',9.00,'',1,3,0),(38,'[Goi Cuon Chay] Tofu Spring Rolls (2)','Rice Paper Rolls filled with Fried Tofu, Vermicelli Noodles & Green Leaf Vegetables',9.00,'',1,3,0),(39,'[Quay] Chinese Doughnut','Light, airy and pleasantly chewy',4.50,'',1,3,0),(40,'[Dau Hu Chien] Fried Tofu',NULL,13.00,'',1,3,0),(41,'[Dau Hu Rang Muoi] Salt and Pepper Fried Tofu',NULL,13.00,'',1,3,0),(51,'[Chao CA TBT] Fish & Pidan Egg Porridge',NULL,15.00,'',1,4,0),(52,'[Chao Heo TBT] Pork & Pidan Egg Porridge',NULL,15.00,'',1,4,0),(53,'[Chao Bo] Beef Porridge',NULL,15.00,'',1,4,0),(54,'[Chao Ga] Chicken Porridge',NULL,15.00,'',1,4,0),(55,'[Chao Long] Innard Porridge',NULL,15.00,'',1,4,0),(56,'Bun Rieu','Vietnamese Crab Based Noodle Soup',15.00,'',1,5,0),(57,'[BBH] Spicy Beef Noodle Soup','Noodle Soup with a Rich Spicy Broth with Slices of Beef and Pork',15.00,'',1,6,0),(58,'[HTDB] Combination Meat and Seafood Noodle Soup','Choice of Rice Noodle, Fresh Rice Noodle, Clear Noodle, or Egg Noodle',16.00,'',1,7,0),(59,'[Mi Tom] Shrimp Noodle Soup','Choice of Rice Noodle, Fresh Rice Noodle, Clear Noodle, or Egg Noodle',16.00,'',1,7,0),(60,'[Mi Xa Xiu] BBQ Pork Noodle Soup','Choice of Rice Noodle, Fresh Rice Noodle, Clear Noodle, or Egg Noodle',16.00,'',1,7,0),(61,'[Mi HT XX] BBQ Pork w/Wonton Egg Noodle Soup','Choice of Rice Noodle, Fresh Rice Noodle, Clear Noodle, or Egg Noodle',16.00,'',1,7,0),(62,'[Xup HT TC] Combination Wor Wonton Soup','Does Not Come with Noodles. If Noodles are desired, please select Add Noodles (+$2.00) Otherwise, select \"No Noodle\"',16.00,'',1,7,0),(63,'[Xup HT XX] BBQ Pork Wonton Soup','Does Not Come with Noodles. If Noodles are desired, please select Add Noodles (+$2.00) Otherwise, select \"No Noodle\"',16.00,'',1,7,0),(64,'[Mi Rau Cai] Vegetable Noodle Soup','Choice of Rice Noodle, Fresh Rice Noodle, Clear Noodle, or Egg Noodle',16.00,'',1,7,0),(65,'[Xup HT] Wonton Soup','Does Not Come with Noodles. If Noodles are desired, please select Add Noodles (+$2.00) Otherwise, select \"No Noodle\"',16.00,'',1,7,0),(66,'[Com SN] Grilled Pork Chop with Rice',NULL,16.00,'',1,8,0),(67,'[Com T, CG, SN] Grilled Pork Chop, Shrimp, and Egg Roll with Rice',NULL,18.00,'',1,8,0),(68,'[Com Bi, Cha, SN] Grilled Pork Chop, Shredded Skin Pork and Egg Foo Young with Rice',NULL,18.00,'',1,8,0),(69,'[Com TN] Grilled Pork with Rice',NULL,16.00,'',1,8,0),(70,'[Com T, CG, TN] Grilled Pork, Shrimp, and Egg Roll with Rice',NULL,18.00,'',1,8,0),(71,'[Com Bi, Cha, TN] Grilled Pork, Shredded Skin Pork, and Egg Foo Young with Rice',NULL,18.00,'',1,8,0),(72,'[Com BN] Grilled Beef with Rice',NULL,16.00,'',1,8,0),(73,'[Com T, CG, BN] Grilled Beef, Shrimp, and Egg Roll with Rice',NULL,18.00,'',1,8,0),(74,'[Com Bi, Cha, BN] Grilled Beef, Shredded Skin Pork and Egg Foo Young with Rice',NULL,18.00,'',1,8,0),(75,'[Com GN] Grilled Chicken with Rice',NULL,16.00,'',1,8,0),(76,'[Com T, CG, GN] Chicken, Shrimp, and Egg Roll with Rice',NULL,18.00,'',1,8,0),(77,'[Com Bi, Cha, GN] Grilled Chicken, Shredded Skin Pork and Egg Foo Young with Rice',NULL,18.00,'',1,8,0),(78,'[Com Ga HN] Steamed Chicken with Garlic Rice',NULL,18.00,'',1,8,0),(79,'[Com Ga XXO] Spicy Lemon Grass Chicken with Rice',NULL,16.00,'',1,8,0),(80,'[Com Bo Mong Co] Mongolian Beef with Rice',NULL,16.00,'',1,8,0),(81,'[Com Bo Luc Lac] Shaken Beef with Rice',NULL,18.00,'',1,8,0),(82,'[Com Ca Hoi] Grilled Salmon with Rice',NULL,18.00,'',1,8,0),(83,'[Com Suon DH] Grilled Korean BBQ Ribs with Rice',NULL,18.00,'',1,8,0),(84,'[Com Chien] Fried Rice',NULL,18.00,'',1,9,0),(85,'[Mi Xao] Chow Mein',NULL,18.00,'',1,9,0),(86,'[Hu Tieu Xao] Chow Fun',NULL,18.00,'',1,9,0),(87,'[Bun T, TN, CG] Grilled Pork, Prawn and Egg Roll w/Vermicelli',NULL,17.00,'',1,10,0),(88,'[Bun T, BN, CG] Grilled Beef, Prawn, and Egg Roll w/Vermicelli',NULL,17.00,'',1,10,0),(89,'[Bun T, GN, CG] Grilled Chicken, Prawn, and Egg Roll w/Vermicelli',NULL,17.00,'',1,10,0),(90,'[Bun Tom Nuong] Grilled Prawn w/Vermicelli',NULL,16.00,'',1,10,0),(91,'[Bun T, TN] Grilled Pork and Prawn w/Vermicelli',NULL,16.00,'',1,10,0),(92,'[Bun TN] Grilled Pork w/Vermicelli',NULL,15.00,'',1,10,0),(93,'[Bun GN] Grilled Chicken w/Vermicelli',NULL,15.00,'',1,10,0),(94,'[Bun BN] Grilled Beef w/Vermicelli',NULL,15.00,'',1,10,0),(95,'[Bun Dau Hu Chien] Fried Tofu w/Vermicelli',NULL,15.00,'',1,10,0),(96,'[Bun TN, CG] Grilled Pork and Egg Roll w/Vermicelli',NULL,16.00,'',1,10,0),(97,'[Bun BN, CG] Grilled Beef and Egg Roll w/Vermicelli',NULL,16.00,'',1,10,0),(98,'[Bun GN, CG] Grilled Chicken and Egg Roll w/Vermicelli',NULL,16.00,'',1,10,0),(99,'[Bun Tom, BN] Grilled Beef and Prawn w/Vermicelli',NULL,16.00,'',1,10,0),(100,'[Ga Chua Ngot] Sweet and Sour Chicken',NULL,18.00,'',1,11,0),(101,'[Ca Kho To] Catfish Clay Pot',NULL,18.00,'',1,11,0),(102,'[Canh Chua] Sweet and Sour Catfish or Shrimp Soup',NULL,26.00,'',1,11,0),(103,'[Tom Pha Le] Honey Walnut Shrimp',NULL,19.00,'',1,11,0),(104,'[Suon Rang Muoi] Pepper Salted Pork Spare Ribs',NULL,18.00,'',1,11,0),(105,'[Suon Nuong] Pork Chop',NULL,18.00,'',1,11,0),(106,'[Bo Luc Lac] Shaken Beef',NULL,22.00,'',1,11,0),(107,'[Bo Xao Dau Ve] Beef w/Green Beans',NULL,18.00,'',1,11,0),(108,'[Do Bien Rau Xao Thap Cam] Seafood Mixed Vegetables',NULL,19.00,'',1,11,0),(109,'[Tom Rang Muoi] Pepper Salted Prawns',NULL,19.00,'',1,11,0),(110,'[Ga Luoc] Steamed Chicken',NULL,20.00,'',1,11,0),(111,'[Thit Nuong] Grilled Pork',NULL,18.00,'',1,11,0),(112,'[Ga Xa Xao Ot] Lemon Grass Chicken',NULL,18.00,'',1,11,0),(113,'[Bo Mong Co] Mongolian Beef',NULL,18.00,'',1,11,0),(114,'Passion Fruit Slushy',NULL,7.00,'',1,12,0),(115,'Strawberry Shake',NULL,7.00,'',1,12,0),(116,'Avocado Shake',NULL,8.00,'',1,12,0),(117,'Coconut Shake',NULL,7.00,'',1,12,0),(118,'Jackfruit Shake',NULL,7.00,'',1,12,0),(119,'Durian Shake',NULL,8.00,'',1,12,0),(120,'Mocha Shake',NULL,7.00,'',1,12,0),(121,'Taro Shake',NULL,7.00,'',1,12,0),(122,'Honeydew Shake',NULL,7.00,'',1,12,0),(123,'Mango Shake',NULL,7.00,'',1,12,0),(124,'Thai Tea Shake',NULL,7.00,'',1,12,0),(125,'Red Bean Shake',NULL,7.00,'',1,12,0),(126,'Banana Smoothie',NULL,7.00,'',1,12,0),(127,'Pineapple Shake',NULL,7.00,'',1,12,0),(128,'Chocolate Shake',NULL,7.00,'',1,12,0),(129,'Three Color Bean',NULL,7.00,'',1,13,0),(130,'Red Bean w/Grass Jelly',NULL,7.00,'',1,13,0);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operating_hours`
--

DROP TABLE IF EXISTS `operating_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operating_hours` (
  `oh_id` int NOT NULL AUTO_INCREMENT,
  `day_of_week` varchar(15) DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `restaurant_is_closed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`oh_id`),
  UNIQUE KEY `day_of_week` (`day_of_week`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operating_hours`
--

LOCK TABLES `operating_hours` WRITE;
/*!40000 ALTER TABLE `operating_hours` DISABLE KEYS */;
INSERT INTO `operating_hours` VALUES (1,'Monday','09:00:00','20:00:00',0),(2,'Tuesday',NULL,NULL,1),(3,'Wednesday','09:00:00','20:00:00',0),(4,'Thursday','09:00:00','20:00:00',0),(5,'Friday','09:00:00','20:00:00',0),(6,'Saturday','09:00:00','20:00:00',0),(7,'Sunday','09:00:00','20:00:00',0);
/*!40000 ALTER TABLE `operating_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordering_links`
--

DROP TABLE IF EXISTS `ordering_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordering_links` (
  `platform_id` int NOT NULL AUTO_INCREMENT,
  `platform_name` varchar(50) DEFAULT NULL,
  `platform_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`platform_id`),
  UNIQUE KEY `platform_name` (`platform_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordering_links`
--

LOCK TABLES `ordering_links` WRITE;
/*!40000 ALTER TABLE `ordering_links` DISABLE KEYS */;
INSERT INTO `ordering_links` VALUES (1,'Toast',NULL),(2,'DoorDash',NULL);
/*!40000 ALTER TABLE `ordering_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int NOT NULL,
  `footer_json` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'{\"contact\": {\"phone\": \"(916) 754-2143\", \"address\": \"6175 Stockton Blvd #200\", \"cityZip\": \"Sacramento, CA 95824\"}, \"navLinks\": [{\"path\": \"/\", \"label\": \"Home\"}, {\"path\": \"/about\", \"label\": \"About\"}, {\"path\": \"/menu\", \"label\": \"Menu\"}, {\"path\": \"/contact\", \"label\": \"Contact\"}, {\"path\": \"https://order.toasttab.com/online/pho-city-6175-stockton-boulevard-200\", \"label\": \"Order\", \"external\": true}], \"socialLinks\": [{\"url\": \"https://instagram.com/\", \"icon\": \"instagram\", \"platform\": \"instagram\"}]}','2026-02-07 05:16:50');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-06 21:27:17
