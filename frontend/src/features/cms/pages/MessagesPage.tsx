import { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/shared/components/ui/button"
import { Reply as ReplyIcon } from "lucide-react";

import {
  type MailMessage, type MailThread,
  getState, getThreads, getThread, markRead, markUnread, reply
} from "@/shared/api/mail";

import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

JavascriptTimeAgo.addDefaultLocale(en);
const timeAgo = new JavascriptTimeAgo('en-US');

const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isError, setIsError] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [email, setEmail] = useState<string>();
  const [threadsData, setThreadsData] = useState<MailThread[]>();
  const [openThread, setOpenThread] = useState<MailThread>();
  const [nextPageToken, setNextPageToken] = useState<string>();

  async function refresh() {
    try {
      const {authenticated, email} = await getState();
      setEmail(email);
      setAuthenticated(authenticated);
      if (authenticated) {
        const {threads, nextPageToken} = await getThreads();
        setThreadsData(threads);
        setNextPageToken(nextPageToken);
        if (searchParams.has("thread")) {
          const threadId = searchParams.get("thread");
          if (threadId != openThread?.id) {
            const thread = threads?.find((thread) => thread.id === threadId);
            if (thread) {
              await switchThread(thread);
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      setIsError(true);
    }
  }

  async function loadMore() {
    try {
      if (nextPageToken) {
        const {threads, nextPageToken: newNextPageToken} = await getThreads({pageToken: nextPageToken});
        if (threadsData) setThreadsData([...threadsData, ...threads]);
        else setThreadsData(threads);
        setNextPageToken(newNextPageToken);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function startAuth() {
    const popup = window.open(`${API_URL}/api/admin/mail/oauth/init`, "googleAuth", "width=500,height=600");
    const listener = (event: MessageEvent) => {
      if (event.data === "gmail-connected") {
        window.removeEventListener("message", listener);
        refresh();
      }
    };
    window.addEventListener("message", listener);
  }

  async function switchThread(thread: MailThread | undefined) {
    if (thread === openThread) {
      thread = undefined;
    }
    setOpenThread(thread);
    const newSearchParams = new URLSearchParams(searchParams) 
    if (thread === undefined) {
      if (newSearchParams.has("thread")) newSearchParams.delete("thread");
      setSearchParams(newSearchParams);
      return;
    } else {
      newSearchParams.set("thread", thread.id);
      setSearchParams(newSearchParams);
    }
    if (thread.isUnread) {
      try {
        await markRead(thread.id);
        thread.isUnread = false;
      } catch (err) {
        console.log(err);
      }
    }
  }

  useEffect(() => {
    refresh();
  }, []);

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
      <div className="grid grid-cols-2 h-[calc(100vh-120px)] -my-6 -mx-3">
        <div className="space-y-2.5 overflow-y-auto py-6 px-3">
          {threadsData.map((thread) => (
            <ThreadPreview thread={thread} selected={thread.id === openThread?.id} onClick={() => switchThread(thread)} />
          ))}
          <div className="flex flex-row items-center justify-center py-1">
            {nextPageToken &&
              <button className="text-sm px-6 py-2 rounded-md bg-brand-red text-white shadow-md" onClick={loadMore}>
                Load More
              </button>
            }
          </div>
        </div>
        <div className="overflow-y-auto py-6 px-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-h-full">
          {openThread?.messages ? <div className="space-y-3">
            {openThread.messages.map((message) => (
              <MessageView message={message} />
            ))}
            <button className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
              <ReplyIcon size={20} /> Reply
            </button>
          </div> : <div className="text-center m-6 text-gray-400">No Conversation Selected</div>}
        </div>
        </div>
      </div>
    );
  }
}

function ThreadPreview({ thread, onClick, selected }: { thread: MailThread, onClick: () => Promise<void>, selected?: boolean }) {
  const [isUnread, setIsUnread] = useState<boolean>(thread.isUnread);
  
  async function toggleRead() {
    try {
      if (thread.isUnread) {
        await markRead(thread.id);
        thread.isUnread = false;
        setIsUnread(false);
      } else {
        await markUnread(thread.id);
        thread.isUnread = true;
        setIsUnread(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const message = thread.messages[0];
  if (message === undefined) return null;
  return (
    <article
      key={thread.id}
      className={
        selected ?
          "bg-brand-red/10 p-4 rounded-lg shadow-sm border border-brand-red/50" :
          "bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition"}
      onClick={() => onClick().then(() => setIsUnread(false))}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0 flex flex-row gap-3 items-center">
          <button className={`rounded-xl w-4.5 h-4.5 hover:bg-gray-200 transition -m-1.5 p-1.5`} onClick={(e) => {e.stopPropagation(); toggleRead();}} title={isUnread ? "Mark Read" : "Mark Unread"}>
            <div className={`rounded-xl w-1.5 h-1.5 ${isUnread ? "bg-brand-red" : "bg-gray-300"}`}></div>
          </button>
          <h4 className={`font-${isUnread ? "semibold" : "normal"} text-sm text-gray-800 truncate`}>
            {message.fromName || message.fromEmail}
          </h4>
          {thread.messages.length > 1 && <span className="text-sm text-gray-500">{thread.messages.length}</span>}
        </div>
        <span className="text-xs text-gray-500">{timeAgo.format(new Date(message.date))}</span>
      </div>

      <div className="text-gray-600 text-sm flex flex-row gap-3 items-center">
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