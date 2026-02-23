import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button"

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
            <>
                <h1>Fetch Results</h1>
                <p>This is a temporary screen to demonstrate the response from getThreads</p>
                {threadsData.map((thread) => (
                    <div className="my-10">
                        <h2>Thread ID: {thread.id}</h2>
                        {thread.messages.map((message) => (
                            <div className="my-4">
                                <h3>Message ID: {message.id}</h3>
                                {Object.entries(message).map(([key, value]) => (<p>{key}: {String(value)}</p>))}
                            </div>
                        ))}
                    </div>
                ))}
            </>
        );
    }
}