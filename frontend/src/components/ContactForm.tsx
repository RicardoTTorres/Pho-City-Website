import { useState, type FormEvent } from "react";

export const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch('http://localhost:5000/api/contact', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-brand-gold/30 p-8 md:p-10 flex flex-col h-full w-full">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-brand-red mb-2">
        Send us a Message
      </h2>
      <p className="text-center text-gray-700 mb-8">
        We'll get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white border border-brand-gold/30 rounded-lg p-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all duration-200 shadow-sm"
        />

        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-brand-gold/30 rounded-lg p-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all duration-200 shadow-sm"
        />

        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={8}
          className="w-full bg-white border border-brand-gold/30 rounded-lg p-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all duration-200 resize-none shadow-sm"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full font-semibold py-4 rounded-lg text-white transition-all duration-300 shadow-md ${
                       status === "loading"
                         ? "bg-brand-gold cursor-wait"
                         : "bg-brand-red hover:bg-brand-redHover hover:shadow-lg hover:scale-[1.02]"
                     }`}
        >
          {status === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status === "success" && (
        <p className="text-center text-green-600 font-semibold mt-6 bg-green-50 py-3 rounded-lg">
          ✓ Message sent successfully!
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-red-600 font-semibold mt-6 bg-red-50 py-3 rounded-lg">
          ✗ Failed to send message. Please try again.
        </p>
      )}
    </div>
  );
};
