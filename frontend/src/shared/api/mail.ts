const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export type MailMessage = {
  id: string,
  threadId: string,
  fromEmail: string,
  fromName: string | undefined,
  fromSelf: boolean,
  date: string,
  subject: string,
  snippet: string,
  body: string | undefined,
  isUnread: boolean,
  isPreview: boolean,
  isGmail: boolean
};

export type MailThread = {
  id: string,
  messages: MailMessage[],
  isUnread: boolean,
  date: string,
  snippet: string,
  people: string[],
  isPreview: boolean,
  isGmail: boolean
};

export async function getState(): Promise<{ authenticated: boolean, registered: boolean, email: string }> {
    const response = await fetch(
        `${API_URL}/api/admin/mail/oauth/state`,
        { credentials: "include" }
    );
    if (!response.ok) {
        throw new Error(`Server error in mail getState: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

export async function getThreads(options: {pageToken?: string | undefined, maxResults?: number | undefined} = {}): Promise<{threads: MailThread[], nextPageToken: string | undefined}> {
    const queryParams = new URLSearchParams();
    if (options.pageToken) queryParams.append("pageToken", options.pageToken);
    if (options.maxResults) queryParams.append("maxResults", String(options.maxResults));
    
    const response = await fetch(
        `${API_URL}/api/admin/mail/threads?${queryParams.toString()}`,
        {credentials: "include"}
    );
    if (!response.ok) {
        throw new Error(`Server error in mail getThreads: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

export async function getThread(id: string, options: {forceRefresh?: boolean | undefined} = {}): Promise<MailThread> {
    const response = await fetch(
        `${API_URL}/api/admin/mail/threads/${id}${options.forceRefresh ? "?forceRefresh=true" : ""}`,
        {credentials: "include"}
    );
    if (!response.ok) {
        throw new Error(`Server error in mail getThread: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

export async function markRead(threadId: string, options: {db?: boolean | undefined} = {}) {
    const response = await fetch(
        `${API_URL}/api/admin/mail/threads/${threadId}/read${options.db ? "?db=true" : ""}`,
        {
            method: "POST",
            credentials: "include"
        }
    );
    if (!response.ok) {
        throw new Error(`Server error in mail markRead: ${response.status} ${response.statusText}`);
    }
}

export async function markUnread(threadId: string, options: {db?: boolean | undefined} = {}) {
    const response = await fetch(
        `${API_URL}/api/admin/mail/threads/${threadId}/unread${options.db ? "?db=true" : ""}`,
        {
            method: "POST",
            credentials: "include"
        }
    );
    if (!response.ok) {
        throw new Error(`Server error in mail markUnread: ${response.status} ${response.statusText}`);
    }
}

export async function reply(threadId: string, body: string) {
    const response = await fetch(
        `${API_URL}/api/admin/mail/threads/${threadId}/reply`,
        {
            method: "POST",
            body: JSON.stringify({body}),
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        }
    );
    if (!response.ok) {
        throw new Error(`Server error in mail reply: ${response.status} ${response.statusText}`);
    }
}

export async function getSavedThreads(): Promise<{threads: MailThread[], nextPageToken: undefined}> {
    const response = await fetch(
        `${API_URL}/api/admin/mail/savedthreads`,
        {credentials: "include"}
    );
    if (!response.ok) {
        throw new Error(`Server error in mail getSavedThreads: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data
}