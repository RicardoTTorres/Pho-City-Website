import { ContactForm } from "@/components/ContactForm";
import { useContent } from "@/context/ContentContext";

export default function Contact() {
  const { content } = useContent();
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    return (
        <section className="bg-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="font-bold text-center">Contact Us</h1>
                <p className="text-center text-gray-500">Visit us, call us, or send us a message</p>
                <div className="flex min-h-screen">
                    <div className="w-1/2 bg-gray-100 text-gray-800 flex-col items-center justify-center m-8">
                        {InfoBox("Location", "ContactLocation.svg", [content.contact.address])}
                        {InfoBox("Phone", "ContactPhone.svg", [content.contact.phone, "For takeout and delivery"])}
                        {InfoBox("Hours", "ContactHours.svg", daysOfWeek.map(day => day + ": " + content.contact.hours[day]))}
                        {InfoBox("Email", "ContactEmail.svg", ["info@phocity.com"])}
                    </div>
                    <div className="w-1/2 bg-gray-100 text-gray-800 flex items-center justify-center m-8">
                        <div className="w-full bg-white border rounded-md p-6">
                            <p className="text-center font-bold">Send us a message</p>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
}
function InfoBox(header: string, icon: string, body: string[]) {
    return (
        <div className="w-full bg-white border rounded-md p-6 my-6 flex flex-row">
            <div className="shrink-0 m-2">
                <img src={`/src/assets/${icon}`} width="24" height="24" />
            </div>
            <div className="m-2">
                <p className="font-bold">{header}</p>
                {body.map(line => (<p className="text-gray-500">{line}</p>))}
            </div>
        </div>
    );
}