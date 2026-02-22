// src/features/public/pages/About.tsx
import { useContent } from "@/app/providers/ContentContext";
import aboutUs from "@/shared/assets/aboutUs.png";

export default function About() {
  const { content } = useContent();

  return (
    <div className="bg-[#FFF8F1] w-full min-h-screen">
      <section className="max-w-7xl mx-auto px-8 md:px-16 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-14">
          <div className="md:max-w-[48%]">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A62626] mb-6">
              {content.about.title}
            </h1>
            <div className="w-20 h-[3px] bg-[#C5A572] mb-8 rounded-full" />
            <div className="bg-white shadow-lg rounded-2xl p-8 md:p-10 border border-[#E8E8E8]">
              <p className="whitespace-pre-line text-[#2B2B2B] text-lg leading-relaxed">
                {content.about.content}
              </p>
            </div>
          </div>
          <div className="flex justify-center md:justify-end w-full md:w-auto">
            <img
              src={aboutUs}
              alt="About Pho City"
              className="
                w-[420px] md:w-[520px]
                rounded-2xl shadow-2xl
                border-[2.5px] border-[#A62626]/20
              "
            />
          </div>
        </div>
      </section>
    </div>
  );
}
