import React from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-accent-cream text-text-charcoal">
      {/* Navbar */}
      <nav className="w-full bg-warm-cream shadow-sm py-4 px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-red">Pho City</h1>
        <ul className="flex space-x-8 text-lg font-medium">
          <li className="text-secondary-gold cursor-pointer hover:text-primary-red transition-colors">
            Home
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-8">
        <h2 className="text-5xl font-bold text-primary-red mb-6">
          Welcome to Pho City
        </h2>
        <p className="text-lg text-gray-700 max-w-xl mb-8">
          Experience authentic Vietnamese flavors made fresh daily. From our
          savory pho broth to our crispy egg rolls — every dish is crafted with
          care.
        </p>
        <button className="bg-primary-red text-white text-lg font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg">
          Order Now
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full bg-warm-cream py-6 text-center text-gray-700">
        <p className="text-sm">
          © {new Date().getFullYear()} Pho City. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
