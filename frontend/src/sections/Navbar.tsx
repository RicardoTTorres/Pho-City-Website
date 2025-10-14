import React from "react";
import { Button } from "@/components/ui/button";


export default function Navbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-accent-cream shadow-sm border-b-2 border-red-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center">  
              alt="Pho City Vietnamese Cuisine Logo"
              className="h-24 w-auto object-contain"
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('menu')}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              Menu
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              About Us
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              Contact Us
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => scrollToSection('online-order')}
            >
              Online Order
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600"
            >
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
