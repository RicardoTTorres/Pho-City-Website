

INSERT INTO `about_section` (`about_id`, `about_title`, `about_description`, `about_page_url`)
VALUES (
  1,
  'Pho City: Where Vietnamese Cuisine Transcends Expectations!',
  'Welcome to Pho City, Sacramento''s destination for authentic Vietnamese flavors.',
  NULL
)
ON DUPLICATE KEY UPDATE
  `about_title` = VALUES(`about_title`),
  `about_description` = VALUES(`about_description`),
  `about_page_url` = VALUES(`about_page_url`);

INSERT INTO `hero_section` (`hero_id`, `hero_main_title`, `hero_subtitle`, `hero_button_text`, `hero_secondary_button_text`, `hero_image_url`)
VALUES (
  1,
  'Authentic Vietnamese Cuisine',
  'Experience authentic Vietnamese flavors in the heart of Sacramento.',
  'View Our Menu',
  'Call Now',
  NULL
)
ON DUPLICATE KEY UPDATE
  `hero_main_title` = VALUES(`hero_main_title`),
  `hero_subtitle` = VALUES(`hero_subtitle`),
  `hero_button_text` = VALUES(`hero_button_text`),
  `hero_secondary_button_text` = VALUES(`hero_secondary_button_text`),
  `hero_image_url` = VALUES(`hero_image_url`);

INSERT INTO `contact_info` (`contact_id`, `contact_address`, `contact_city`, `contact_state`, `contact_zipcode`, `contact_phone`, `contact_email`)
VALUES (1, '6175 Stockton Blvd #200', 'Sacramento', 'CA', '95824', '(916) 754-2143', 'info@phocity.com')
ON DUPLICATE KEY UPDATE
  `contact_address` = VALUES(`contact_address`),
  `contact_city` = VALUES(`contact_city`),
  `contact_state` = VALUES(`contact_state`),
  `contact_zipcode` = VALUES(`contact_zipcode`),
  `contact_phone` = VALUES(`contact_phone`),
  `contact_email` = VALUES(`contact_email`);

INSERT INTO `operating_hours` (`oh_id`, `day_of_week`, `open_time`, `close_time`, `restaurant_is_closed`) VALUES
  (1, 'Monday', '09:00:00', '20:00:00', 0),
  (2, 'Tuesday', NULL, NULL, 1),
  (3, 'Wednesday', '09:00:00', '20:00:00', 0),
  (4, 'Thursday', '09:00:00', '20:00:00', 0),
  (5, 'Friday', '09:00:00', '20:00:00', 0),
  (6, 'Saturday', '09:00:00', '20:00:00', 0),
  (7, 'Sunday', '09:00:00', '20:00:00', 0)
ON DUPLICATE KEY UPDATE
  `open_time` = VALUES(`open_time`),
  `close_time` = VALUES(`close_time`),
  `restaurant_is_closed` = VALUES(`restaurant_is_closed`);

INSERT INTO `ordering_links` (`platform_id`, `platform_name`, `platform_url`) VALUES
  (1, 'Toast', NULL),
  (2, 'DoorDash', NULL)
ON DUPLICATE KEY UPDATE
  `platform_url` = VALUES(`platform_url`);

INSERT INTO `menu_categories` (`category_id`, `category_name`) VALUES
  (1, 'Pho'),
  (2, 'Appetizers')
ON DUPLICATE KEY UPDATE
  `category_name` = VALUES(`category_name`);

INSERT INTO `menu_items` (`item_id`, `item_name`, `item_description`, `item_price`, `item_image_url`, `item_is_visible`, `category_id`, `is_featured`) VALUES
  (1, 'Pho Tai', 'Beef noodle soup with rare steak', 15.00, NULL, 1, 1, 1),
  (2, 'Goi Cuon', 'Fresh spring rolls', 9.00, NULL, 1, 2, 0)
ON DUPLICATE KEY UPDATE
  `item_name` = VALUES(`item_name`),
  `item_description` = VALUES(`item_description`),
  `item_price` = VALUES(`item_price`),
  `item_image_url` = VALUES(`item_image_url`),
  `item_is_visible` = VALUES(`item_is_visible`),
  `category_id` = VALUES(`category_id`),
  `is_featured` = VALUES(`is_featured`);

INSERT INTO `traffic_dates` (`date`, `date_views`) VALUES
  ('2025-11-10', 75),
  ('2025-11-11', 120),
  ('2025-11-12', 95),
  ('2025-11-13', 180),
  ('2025-11-14', 160),
  ('2025-11-15', 130)
ON DUPLICATE KEY UPDATE
  `date_views` = VALUES(`date_views`);

INSERT INTO `traffic_pages` (`page`, `page_views`) VALUES
  ('/', 420),
  ('/about', 180),
  ('/contact', 110),
  ('/menu', 500),
  ('/stats', 38)
ON DUPLICATE KEY UPDATE
  `page_views` = VALUES(`page_views`);
