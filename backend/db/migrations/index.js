import * as contentAndContact from "./001_content_and_contact.js";
import * as menuAndCustomization from "./002_menu_and_customization.js";
import * as settingsActivityAnalytics from "./003_settings_activity_and_analytics.js";
import * as authentication from "./004_authentication.js";
import * as mailCache from "./005_mail_cache.js";

export const migrations = [
  contentAndContact,
  menuAndCustomization,
  settingsActivityAnalytics,
  authentication,
  mailCache,
];
