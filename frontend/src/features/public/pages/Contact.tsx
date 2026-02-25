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
            <h2 className="text-center md:text-3xl center font-bold text-brand-red mb-3">
              Contact Information
            </h2>
          </div>

          {/*Contact Details*/}
          <div className="space-y-5 mb-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-brand-red text-lg mb-1">
                  Location
                </p>
                <p className="text-gray-700">{content.contact.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-brand-red text-lg mb-1">
                  Phone
                </p>
                <p className="text-gray-700">{content.contact.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-brand-red text-lg mb-1">
                  Email
                </p>
                <p className="text-gray-700">info@phocity.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-brand-red text-lg mb-1">
                  Hours
                </p>
                <div className="text-gray-700 space-y-1">
                  {daysOfWeek.map((day) => (
                    <p key={day} className="text-sm">
                      <span className="font-medium">{day}:</span>{" "}
                      {content.contact.hours[day]}
                    </p>
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
