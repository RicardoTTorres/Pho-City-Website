-- Ensure footer JSON uses a valid web path for the Instagram icon.
-- This keeps existing data but upgrades non-path icon values to /instagram_icon.png.
UPDATE site_settings
SET footer_json = JSON_SET(
  footer_json,
  '$.socialLinks[0].icon',
  '/instagram_icon.png'
)
WHERE id = 1
  AND (
    JSON_EXTRACT(footer_json, '$.socialLinks[0].platform') = 'instagram'
  )
  AND (
    JSON_EXTRACT(footer_json, '$.socialLinks[0].icon') IS NULL
    OR JSON_EXTRACT(footer_json, '$.socialLinks[0].icon') = '\"instagram\"'
    OR JSON_EXTRACT(footer_json, '$.socialLinks[0].icon') = '\"\"'
  );
