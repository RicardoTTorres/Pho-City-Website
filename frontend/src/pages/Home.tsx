import { Hero } from "@/sections/Hero";
import MenuPreview, { type Dish } from "@/sections/MenuPreview";

export default function Home() {
  const items: Dish[] = [
    // Pho
    { id: "pho-tai", category: "Pho", name: "Pho Tai", blurb: "Rare beef pho with fresh herbs and lime", price: "$12.95", href: "/menu#pho" },
    { id: "pho-ga", category: "Pho", name: "Pho Ga", blurb: "Traditional chicken pho with aromatic broth", price: "$11.95", href: "/menu#pho" },
    { id: "pho-chay", category: "Pho", name: "Pho Chay", blurb: "Vegetarian pho with tofu and vegetables", price: "$10.95", href: "/menu#pho" },

    // Appetizers
    { id: "spring-fresh", category: "Appetizers", name: "Fresh Spring Rolls", blurb: "Rice paper rolls with shrimp, lettuce, and herbs", price: "$8.95", href: "/menu#appetizers" },
    { id: "spring-fried", category: "Appetizers", name: "Fried Spring Rolls", blurb: "Crispy rolls filled with pork and vegetables", price: "$7.95", href: "/menu#appetizers" },

    // Rice Dishes
    { id: "com-ga", category: "Rice Dishes", name: "Com Ga", blurb: "Steamed rice with grilled chicken and fish sauce", price: "$12.95", href: "/menu#rice" },
    { id: "com-bo", category: "Rice Dishes", name: "Com Bo", blurb: "Steamed rice with marinated beef and pickled veggies", price: "$13.95", href: "/menu#rice" },
  ];

  return (
    <>
      <Hero />
      <MenuPreview items={items} maxPerCategory={3} />
    </>
  );
}
