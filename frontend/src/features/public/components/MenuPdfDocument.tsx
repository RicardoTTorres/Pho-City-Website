// src/features/public/components/MenuPdfDocument.tsx
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { parseBilingualName } from "@/utils/menuHelper";
import type { MenuCategory, Weekday } from "@/shared/content/content.types";

const BRAND = {
  red: "#A31D24",
  gold: "#E2A818",
  cream: "#FFF8F0",
  charcoal: "#231E1C",
};

const DAY_ABBR: Record<Weekday, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const DAY_ORDER: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const styles = StyleSheet.create({
  page: {
    backgroundColor: BRAND.cream,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    color: BRAND.charcoal,
  },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  logo: {
    width: 72,
    height: 72,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
  },
  subtitle: {
    fontSize: 10,
    color: BRAND.gold,
    fontFamily: "Helvetica-Oblique",
    marginTop: 2,
  },
  divider: {
    height: 2,
    backgroundColor: BRAND.gold,
    marginVertical: 8,
  },
  // Contact bar
  contactBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 9,
    color: BRAND.charcoal,
  },
  // Hours
  hoursSection: {
    marginBottom: 12,
  },
  hoursTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
    textAlign: "center",
    marginBottom: 4,
  },
  hoursGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  hoursEntry: {
    flexDirection: "row",
    width: "25%",
    fontSize: 8,
  },
  hoursDay: {
    fontFamily: "Helvetica-Bold",
    width: 28,
  },
  hoursTime: {
    flex: 1,
  },
  // Menu
  categoryHeader: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.gold,
  },
  itemRow: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  itemNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  itemEnglish: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.charcoal,
    flex: 1,
  },
  itemPrice: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
    marginLeft: 8,
  },
  itemVietnamese: {
    fontSize: 8,
    fontFamily: "Helvetica-Oblique",
    color: BRAND.gold,
    marginTop: 1,
  },
  itemDescription: {
    fontSize: 8,
    color: "#666666",
    marginTop: 1,
  },
  // Footer
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#999999",
  },
});

interface MenuPdfDocumentProps {
  categories: MenuCategory[];
  restaurantName: string;
  address: string;
  cityZip: string;
  phone: string;
  hours: Record<Weekday, string>;
  logoUrl: string;
}

function formatPrice(price: string | number): string {
  const num = Number.parseFloat(
    (price || "0").toString().replace(/[^0-9.]/g, ""),
  );
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : "";
}

export function MenuPdfDocument({
  categories,
  restaurantName,
  address,
  cityZip,
  phone,
  hours,
  logoUrl,
}: MenuPdfDocumentProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document title={`${restaurantName} Menu`} author={restaurantName}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.brandName}>{restaurantName}</Text>
            <Text style={styles.subtitle}>Vietnamese Cuisine</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Contact bar */}
        <View style={styles.contactBar}>
          <Text style={styles.contactText}>
            {address}
            {cityZip ? `, ${cityZip}` : ""}
          </Text>
          <Text style={styles.contactText}>{phone}</Text>
        </View>

        {/* Hours */}
        <View style={styles.hoursSection}>
          <Text style={styles.hoursTitle}>Hours</Text>
          <View style={styles.hoursGrid}>
            {DAY_ORDER.map((day) => (
              <View key={day} style={styles.hoursEntry}>
                <Text style={styles.hoursDay}>{DAY_ABBR[day]}</Text>
                <Text style={styles.hoursTime}>{hours[day] || "Closed"}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Menu categories + items */}
        {categories.map((category) => {
          const visibleItems = (category.items ?? []).filter(
            (item) => item.visible !== false,
          );
          if (visibleItems.length === 0) return null;

          return (
            <View key={category.id || category.name}>
              <Text style={styles.categoryHeader}>{category.name}</Text>
              {visibleItems.map((item) => {
                const { english, vietnamese } = parseBilingualName(item.name);
                return (
                  <View key={item.id || item.name} style={styles.itemRow} wrap={false}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemEnglish}>{english}</Text>
                      <Text style={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                    {vietnamese && (
                      <Text style={styles.itemVietnamese}>{vietnamese}</Text>
                    )}
                    {item.description && (
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Page footer */}
        <Text style={styles.pageFooter} fixed>
          Menu prices subject to change. Generated {generatedDate}.
        </Text>
      </Page>
    </Document>
  );
}
