

export default function Hero() {
  return (
    <section id="top" className="mx-auto max-w-7xl px-6 py-20 grid gap-8 md:grid-cols-2 items-center">
      <div>
        <h1 className="text-4xl md:text-6xl font-bold text-red-600 mb-4 leading-none">
          Authentic Vietnamese Flavor
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-3xl">
          From rich, aromatic pho broth to crispy egg rolls—each dish is crafted fresh daily with care.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-6 py-3 text-base font-semibold shadow-lg transition-colors hover:bg-red-700">
            Order Now
          </a>
          <a href="#about" className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-6 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-gray-100">
            Learn More
          </a>
        </div>
      </div>

      <div className="h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl bg-gray-100 grid place-items-center">
        <span className="text-gray-500">Hero Image Placeholder</span>
      </div>
    </section>
  );
}
