// src/features/public/pages/Contact.tsx
import { useEffect, useState } from "react";
import { ContactForm } from "@/features/public/components/ContactForm";
import { useContent } from "@/app/providers/ContentContext";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Weekday } from "@/shared/content/content.types";

export default function Contact() {
  const { content } = useContent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const daysOfWeek: Weekday[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-brand-cream to-brand-gold/10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl w-full items-stretch">
        {/*Left Column: Unified Contact Info + Map Card*/}
        <div
          className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-brand-gold/30 p-8 flex flex-col h-full transition-all duration-500 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          style={{ transitionDelay: mounted ? "200ms" : "0ms" }}
        >
          {/*Contact Information Header*/}
          <div className="mb-6">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-brand-red mb-2">
              Contact Information
            </h2>
            <div className="mx-auto h-1 w-12 rounded-full bg-gradient-to-r from-brand-gold to-brand-red" />
          </div>

          {/*Contact Details*/}
          <div className="space-y-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5 bg-brand-red/10 rounded-lg p-2">
                <MapPin className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <p className="font-semibold text-brand-red text-base mb-0.5">Location</p>
                <p className="text-gray-700 text-sm leading-snug">{content.contact.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5 bg-brand-red/10 rounded-lg p-2">
                <Phone className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <p className="font-semibold text-brand-red text-base mb-0.5">Phone</p>
                <p className="text-gray-700 text-sm">{content.contact.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5 bg-brand-red/10 rounded-lg p-2">
                <Mail className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <p className="font-semibold text-brand-red text-base mb-0.5">Email</p>
                <p className="text-gray-700 text-sm">{content.contact.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5 bg-brand-red/10 rounded-lg p-2">
                <Clock className="w-5 h-5 text-brand-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-red text-base mb-2">Hours</p>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {daysOfWeek.map((day, i) => (
                    <div
                      key={day}
                      className={`flex justify-between items-center px-3 py-1.5 text-sm ${i % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}
                    >
                      <span className="font-medium text-gray-700">{day}</span>
                      <span className="text-gray-500 text-right">{content.contact.hours[day]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/*Embedded Google Map*/}
          <div className="flex-grow min-h-[200px] lg:min-h-[250px] rounded-xl overflow-hidden shadow-lg ring-1 ring-brand-red/20">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3120.9477384856786!2d-121.43884882346478!3d38.52079197180658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x809ad0c8c8c8c8c8%3A0x1234567890abcdef!2s6175%20Stockton%20Blvd%20%23200%2C%20Sacramento%2C%20CA%2095824!5e0!3m2!1sen!2sus!4v1698765432100"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pho City Location - 6175 Stockton Blvd #200, Sacramento, CA 95824"
            ></iframe>
          </div>
        </div>

        {/*Right Column: Contact Form*/}
        <div
          className={`flex h-full transition-all duration-500 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          style={{ transitionDelay: mounted ? "300ms" : "0ms" }}
        >
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
