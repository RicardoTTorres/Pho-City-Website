// src/features/cms/pages/DashboardPage.tsx
import {
  PlusCircle,
  Edit,
  Image,
  Pencil,
  Utensils,
  Navigation,
  LayoutTemplate,
  FileText,
  Phone,
  Trash2,
  Reply as ReplyIcon,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TrafficOverviewEditor } from "@/features/cms/sections/TrafficOverviewEditor";
import { fetchRecentActivity, type ActivityEntry } from "@/shared/api/activity";

function getActivityIcon(section: string, action: string) {
  if (action === "deleted")
    return <Trash2 size={16} className="text-red-500" />;
  switch (section) {
    case "menu_item":
    case "menu_category":
      return <Utensils size={16} className="text-gray-500" />;
    case "navbar":
      return <Navigation size={16} className="text-gray-500" />;
    case "hero":
      return <LayoutTemplate size={16} className="text-gray-500" />;
    case "footer":
      return <LayoutTemplate size={16} className="text-gray-500" />;
    case "about":
      return <FileText size={16} className="text-gray-500" />;
    case "contact":
      return <Phone size={16} className="text-gray-500" />;
    default:
      return <Pencil size={16} className="text-gray-500" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DashboardPage() {
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    fetchRecentActivity()
      .then(setRecentActivity)
      .catch((err) => console.error("Failed to load activity:", err));
  }, []);

  const latestMessages: Array<{
    name: string;
    snippet: string;
    time: string;
    email: string;
    subject?: string;
  }> = [
    {
      name: "Bill Nye",
      snippet: "Loved the pho!",
      time: "5 hours ago",
      email: "bill@example.com",
      subject: "Thanks for your feedback",
    },
    {
      name: "John Doe",
      snippet: "Do you have gluten-free options?",
      time: "1 day ago",
      email: "john@example.com",
      subject: "About gluten-free options",
    },
    {
      name: "Lychee T",
      snippet: "Dog friendly??",
      time: "2 days ago",
      email: "lychee@example.com",
      subject: "Re: Dog friendly",
    },
  ];

  const [replyingIndex, setReplyingIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  function startReply(idx: number, name: string) {
    setReplyingIndex(idx);
    const firstName = (name?.split(" ")[0] ?? "").replace(/[^\w-]/g, "");
    setReplyText(`Hi ${firstName},\n\n`);
  }

  function cancelReply() {
    setReplyingIndex(null);
    setReplyText("");
  }

  function sendReply(idx: number) {
    const m = latestMessages[idx];
    if (!m) return;
    const subject = m.subject ?? `Re: Your message to Pho City`;
    const body = replyText || "Hi,\n\n";
    const href = `mailto:${m.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    cancelReply();
  }

  return (
    <div className="space-y-6">
      {/*Quick Actions*/}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button className="flex items-center justify-center gap-2 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-700 transition">
          <Edit size={18} /> Edit Content
        </button>
        <button className="flex items-center justify-center gap-2 bg-brand-red text-white p-3 rounded-lg hover:bg-brand-redHover transition">
          <PlusCircle size={18} /> Add Menu Item
        </button>
        <button className="flex items-center justify-center gap-2 bg-brand-gold text-white p-3 rounded-lg hover:bg-yellow-600 transition">
          <Image size={18} /> Upload Image
        </button>
      </section>

      {/*Overview Stats*/}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-700">Total Pages</p>
          <h2 className="text-2xl font-semibold text-gray-600">4</h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-700">Menu Items</p>
          <h2 className="text-2xl font-semibold text-gray-600">120</h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-700">Images Uploaded</p>
          <h2 className="text-2xl font-semibold text-gray-600">3</h2>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/*Recent Activity*/}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item, idx) => (
                <li
                  key={item.id}
                  className={idx > 0 ? "border-t border-gray-100 pt-3" : ""}
                >
                  <div className="flex items-start gap-3 text-sm text-gray-700 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
                      {getActivityIcon(item.section, item.action)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.description}</p>
                      <p className="text-xs text-gray-500">
                        {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/*Latest Messages*/}

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Latest Messages
          </h3>

          <div className="space-y-3">
            {latestMessages.map((m, idx) => (
              <article
                key={idx}
                className="rounded-lg border border-gray-100 p-3"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {m.name}
                    </h4>
                    <span className="text-xs text-gray-500">{m.time}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startReply(idx, m.name)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <ReplyIcon size={14} /> Reply
                    </button>
                  </div>
                </div>

                {/* Message Snippet */}
                <div className="bg-gray-50 text-gray-700 text-sm rounded-lg px-3 py-2">
                  {`“${m.snippet}”`}
                </div>

                {/* Reply Box */}
                {replyingIndex === idx && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Reply
                    </label>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                      placeholder={`Write a reply to ${m.name}...`}
                    />

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => sendReply(idx)}
                        className="inline-flex items-center gap-1 bg-brand-red text-white text-xs px-3 py-1.5 rounded-md hover:bg-brand-redHover transition"
                      >
                        <Send size={14} /> Send
                      </button>

                      <button
                        type="button"
                        onClick={cancelReply}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      {/*Traffic Overview*/}
      <section className="bg-white p-6 rounded-xl shadow-sm border mt-6">
        <TrafficOverviewEditor />
      </section>
    </div>
  );
}
