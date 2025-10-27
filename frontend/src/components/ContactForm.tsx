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
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
      <h2 className="text-center text-2xl font-semibold text-brand-red mb-2">
        Send us a message
      </h2>
      <p className="text-center text-gray-600 mb-6">
        We’ll get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-brand-gold/10 border border-gray-300 rounded-md p-3 text-gray-800 
                     placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-brand-gold focus:border-brand-red transition duration-200"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-brand-gold/10 border border-gray-300 rounded-md p-3 text-gray-800 
                     placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-brand-gold focus:border-brand-red transition duration-200"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full bg-brand-gold/10 border border-gray-300 rounded-md p-3 text-gray-800 
                     placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-brand-gold focus:border-brand-red transition duration-200 resize-none"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full font-semibold py-3 rounded-md text-white transition-all duration-300 shadow-sm 
                     ${
                       status === "loading"
                         ? "bg-brand-gold cursor-wait"
                         : "bg-brand-red hover:bg-brand-gold hover:text-brand-red"
                     }`}
        >
          {status === "loading" ? "Sending..." : "Send"}
        </button>
      </form>

      {status === "success" && (
        <p className="text-center text-green-600 font-medium mt-4">
           Message sent successfully!
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-red-600 font-medium mt-4">
           Failed to send message. Please try again.
        </p>
      )}
    </div>
  );
};
