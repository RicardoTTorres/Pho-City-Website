import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button"

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export default function MessagesPage() {
    const [ authenticated, setAuthenticated ] = useState<boolean>();
    const [ email, setEmail ] = useState<string>();

    async function fetchState() {
        const res = await fetch(`${API_URL}/api/admin/mail/oauth/state`, {credentials: "include"});
        const data = await res.json();
        setEmail(data.email);
        setAuthenticated(data.authenticated);
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

    if (authenticated === undefined) {
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
    } else {
        return (
            <>
                <div>Authenticated. Messages will be here</div>
            </>
        )
    }
}