


import Hero from "./components/Hero";
import Navbar from "./components/Navbar";


export default function App() {
  return (
    <div className="min-h-screen bg-accent-cream text-foreground flex flex-col">
      <Navbar></Navbar>
      <main className="flex-1">
        <Hero />
      </main>
      <footer className="py-6 text-center text-sm text-gray-700">
        © {new Date().getFullYear()} Pho City. All rights reserved.
      </footer>
    </div>
  );
}