import { ContactForm } from "@/components/ContactForm";
import { useContent } from "@/context/ContentContext";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  const { content } = useContent();
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday","Sunday",
  ];

  return (
    <section className="bg-brand-gold/20 text-gray-800 py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-brand-red">Get in touch</h2>
          <p className="text-gray-700 leading-relaxed">
            We'd love to hear from you. Whether you have questions about our
            menu, want to place an order, or simply say hello — feel free to
            reach out.
          </p>

          <ul className="space-y-6">
            <InfoBox
              icon={<MapPin className="w-6 h-6 text-brand-red" />}
              title="Location"
              lines={[content.contact.address]}
            />
            <InfoBox
              icon={<Phone className="w-6 h-6 text-brand-red" />}
              title="Phone"
              lines={[content.contact.phone, "For takeout and delivery"]}
            />
            <InfoBox
              icon={<Clock className="w-6 h-6 text-brand-red" />}
              title="Hours"
              lines={daysOfWeek.map(
                (day) => `${day}: ${content.contact.hours[day]}`
              )}
            />
            <InfoBox
              icon={<Mail className="w-6 h-6 text-brand-red" />}
              title="Email"
              lines={["info@phocity.com"]}
            />
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}

function InfoBox({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="font-semibold text-lg text-brand-red">{title}</p>
        {lines.map((line, i) => (
          <p key={i} className="text-gray-700">
            {line}
          </p>
        ))}
      </div>
    </li>
  );
}
