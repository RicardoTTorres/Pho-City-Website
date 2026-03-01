import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button"
import { Reply as ReplyIcon } from "lucide-react";
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

JavascriptTimeAgo.addDefaultLocale(en);
const timeAgo = new JavascriptTimeAgo('en-US');

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

type MailMessage = {
    id: string,
    threadId: string,
    fromEmail: string,
    fromName: string | undefined,
    fromSelf: boolean,
    date: string,
    subject: string,
    snippet: string
};
type MailThread = {
    id: string, messages: MailMessage[]
};

export default function MessagesPage() {
    const [ isError, setIsError ] = useState<boolean>(false);
    const [ authenticated, setAuthenticated ] = useState<boolean>();
    const [ email, setEmail ] = useState<string>();
    const [ threadsData, setThreadsData ] = useState<MailThread[]>();
    const [ openThread, setOpenThread ] = useState<MailThread>();

    async function fetchState() {
        try {
            const res = await fetch(`${API_URL}/api/admin/mail/oauth/state`, {credentials: "include"});
            const data = await res.json();
            setEmail(data.email);
            setAuthenticated(data.authenticated);
            if (data.authenticated) {
                const threadsRes = await fetch(`${API_URL}/api/admin/mail/threads`, {credentials: "include"});
                const threadsList = await threadsRes.json();
                setThreadsData(threadsList);
            }
        } catch (err) {
            console.log(err);
            setIsError(true);
        }
    }

    useEffect(() => {
        fetchState();
    }, []);

    async function startAuth() {
        const popup = window.open(`${API_URL}/api/admin/mail/oauth/init`, "googleAuth","width=500,height=600");
        const listener = (event: MessageEvent) => {
            if (event.data === "gmail-connected") {
                window.removeEventListener("message", listener);
                fetchState();
            }
        };
        window.addEventListener("message", listener);
    }

    if (isError) {
        return <div>An error occurred, see console</div>

    } else if (authenticated === undefined) {
        return <div>Loading...</div>;

    } else if (!authenticated) {
        return (
            <>
                <h1>Authentication Required</h1>
                <div className="my-4">
                    To enable the user messages inbox, press the button
                    below to give access to the gmail account <strong>{email}</strong>
                </div>
                <Button onClick={startAuth}>Authenticate with Google</Button>
            </>
        );

    } else if (threadsData === undefined) {
        return <div>Loading...</div>;

    } else {
        return (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    {threadsData.map((thread) => (
                        <ThreadPreview thread={thread} selected={thread.id === openThread?.id} onClick={() => setOpenThread(thread)} />
                    ))}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                {openThread?.messages ? <div className="space-y-3">
                    {openThread.messages.map((message) => (
                        <MessageView message={message}/>
                    ))}
                    <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                        <ReplyIcon size={20} /> Reply
                    </button>
                </div> : <div className="text-center m-6 text-gray-400">No Conversation Selected</div>}
                </div>
            </div>
        );
    }
}

function ThreadPreview({ thread, onClick, selected }: { thread: MailThread, onClick: () => void, selected?: boolean }) {
    const message = thread.messages[0];
    if (message === undefined) return null;
    return (
              <article
                key={thread.id}
                className={
                    selected ?
                    "bg-brand-red/10 p-4 rounded-lg shadow-sm border" :
                    "bg-white p-4 rounded-lg shadow-sm border hover:bg-gray-100 transition"}
                onClick={onClick}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex flex-row gap-3 items-center">
                    <div className={`rounded-xl w-1.5 h-1.5 bg-${"brand-red"}`}></div>
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {message.fromName || message.fromEmail}
                    </h4>
                    {thread.messages.length > 1 && <span className="text-sm text-gray-500">{thread.messages.length}</span>}
                  </div>
                  <span className="text-xs text-gray-500">{timeAgo.format(new Date(message.date))}</span>
                </div>

                <div className="text-gray-700 text-sm flex flex-row gap-3 items-center">
                  <div className={`rounded-xl w-1.5 h-1.5`}></div>
                  {message.snippet}
                </div>
              </article>
    );
}

function MessageView({ message }: { message: MailMessage }) {
    return (
              <article
                key={message.id}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex flex-row gap-3 items-center">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {message.fromName || message.fromEmail}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500">{
                    new Intl.DateTimeFormat("en-us", { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.date))
                  }</span>
                </div>

                <div className="text-gray-700 text-sm flex flex-row gap-3 items-center">
                  {message.snippet}
                </div>
              </article>
    );
}