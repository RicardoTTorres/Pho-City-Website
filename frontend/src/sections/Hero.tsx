import { Button } from "./ui/button";
import { useContent } from "./ContentContext";


export function Hero() {
  const { content } = useContent();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.hero.title}
            </h1>
            <p className="text-xl mb-8 text-red-100">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100"
                onClick={() => scrollToSection('menu')}
              >
                {content.hero.ctaText}
              </Button>
              <Button 
                size="lg"
                className="bg-white text-red-600"
                onClick={() => window.open('tel:+19167542143', '_self')}
              >
                Order Online
              </Button>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <div className="rounded-full bg-white p-2 shadow-2xl">
              <div className="rounded-full overflow-hidden">
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}