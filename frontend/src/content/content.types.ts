export type RestaurantContent = {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  about: { title: string; content: string };
  contact: { address: string; phone: string; hours: Record<string, string> };
  menu: { categories: Array<{ id: string; name: string; items: Array<{ id: string; name: string; description?: string; price?: string }> }> };
  onlineOrder: { pickupUrl: string; deliveryUrl: string };
};
