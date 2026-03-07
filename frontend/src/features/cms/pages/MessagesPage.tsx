import { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/shared/components/ui/button"
import { Reply as ReplyIcon, Send } from "lucide-react";

import {
  type MailMessage, type MailThread,
  getState, getThreads, getThread, markRead, markUnread, reply, getSavedThreads
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
  const [openThreadLoading, setOpenThreadLoading] = useState<boolean>(false);
  const [replying, setReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [replyError, setReplyError] = useState<string>();

  async function refresh() {
    try {
      const {authenticated, email} = await getState();
      setEmail(email);
      setAuthenticated(authenticated);
      let tempThreads;
      if (authenticated) {
        const {threads, nextPageToken} = await getThreads();
        setThreadsData(threads);
        setNextPageToken(nextPageToken);
        tempThreads = threads;
      } else {
        const {threads} = await getSavedThreads();
        setThreadsData(threads);
        tempThreads = threads;
      }
      if (searchParams.has("thread")) {
        const threadId = searchParams.get("thread");
        const thread = tempThreads?.find((thread) => thread.id === threadId);
        await switchThread(undefined);
        if (thread) {
          await switchThread(thread);
        }
      } else {
        await switchThread(undefined);
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

  function updateThread(thread: MailThread) {
    if (threadsData == undefined || threadsData.length == 0) return;
    const newThreadsData = threadsData?.map((t) => t.id == thread.id ? thread : t);
    setThreadsData(newThreadsData);
    if (openThread?.id == thread.id) {
      setOpenThread(thread);
    }
    return newThreadsData;
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
    try {
      if (thread?.id === openThread?.id) {
        thread = undefined;
      }
      setReplying(false);
      setReplyText("");
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

      if (thread.isPreview && thread.isGmail) {
        setOpenThreadLoading(true);
        let threadFull = await getThread(thread.id);
        updateThread(threadFull);
        setOpenThreadLoading(false);
      }

      if (thread.isUnread) {
        await markRead(thread.id, {db: !thread.isGmail});
        updateThread({...thread, ...{isUnread: false}});
      }

    } catch (err) {
      console.log(err);
    }
  }

  async function sendReply() {
    if (!openThread?.id) return;
    try {
      if (!openThread.isGmail) {
        window.open(`mailto:${openThread.messages[0]?.fromEmail}?subject=${
          encodeURIComponent(`Re: Your message to Pho City`)
        }&body=${
          encodeURIComponent(replyText)
        }`, "sendMail", "width=500,height=600");
        return;
      }

      setReplyError("Sending...");
      await reply(openThread.id, replyText);
      const thread = await getThread(openThread.id, {forceRefresh: true});
      updateThread(thread);
      setReplying(false);
      setReplyText("");
      setReplyError(undefined);
      
    } catch (err) {
      console.log(err);
      setReplyError("An error occurred. Try again");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (isError) {
    return <div>An error occurred, see console</div>

  } else if (authenticated === undefined) {
    return <div>Loading...</div>;

  } else if (threadsData === undefined) {
    return <div>Loading...</div>;

  } else {
    return (
      <div className="grid grid-cols-2 h-[calc(100vh-120px)] -my-6 -mx-3">
        
        {/* Left Side: Threads List */}
        <div className="space-y-2.5 overflow-y-auto py-6 px-3">

          <div className="space-y-2.5">
            {threadsData.map((thread) => (
              <ThreadPreview key={thread.id} thread={thread} selected={thread.id === openThread?.id} onClick={() => switchThread(thread)} />
            ))}
          </div>

          {nextPageToken &&
            <div className="flex flex-row items-center justify-center py-1">
                <button className="text-sm px-6 py-2 rounded-md bg-brand-red text-white shadow-md" onClick={loadMore}>
                  Load More
                </button>
            </div>
          }

        </div>

        {/* Right Side: Selected Conversation */}
        <div className="overflow-y-auto py-6 px-3">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-h-full">

            {!(openThread?.messages)
            ? // Thread Not Selected
            (
              authenticated
              ? <div className="text-center m-6 text-gray-400">No Conversation Selected</div>
              : // Not Authenticated - Show Authentication in Right Panel
              <div className="m-3">
                <h1>Gmail Not Connected</h1>
                <div className="my-4">
                  The contact form is not connected to your gmail inbox.
                  To view form submissions, direct emails, and full reply chains in one place,
                  press the button below to grant access to the gmail account <strong>{email}</strong>
                </div>
                <Button onClick={startAuth}>Authenticate with Google</Button>
              </div>
            )
            : // Thread Selected - Show Messages
            <div className="space-y-3">

              <div className="space-y-3">
                {openThread.messages.map((message) => (
                  <MessageView key={message.id} message={message} loading={openThreadLoading} />
                ))}
              </div>

              {!replying
              ?
              <button onClick={() => setReplying(true)} className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                <ReplyIcon size={20} /> Reply
              </button>
              :
              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Reply
                </label>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                  placeholder={`Write a reply...`}
                />

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={sendReply}
                    className="inline-flex items-center gap-1 bg-brand-red text-white text-xs px-3 py-1.5 rounded-md hover:bg-brand-redHover transition"
                  >
                    <Send size={14} /> Send
                  </button>

                  <button
                    type="button"
                    onClick={() => {setReplying(false); setReplyText("");}}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
                {replyError &&
                  <span className="text-xs text-gray-500">{replyError}</span>
                }
              </div>}
            </div>}
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
        await markRead(thread.id, {db: !thread.isGmail});
        thread.isUnread = false;
        setIsUnread(false);
      } else {
        await markUnread(thread.id, {db: !thread.isGmail});
        thread.isUnread = true;
        setIsUnread(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <article
      key={thread.id}
      className={
        selected
        ? "bg-brand-red/10 p-4 rounded-lg shadow-sm border border-brand-red/50"
        : "bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition"
      }
      onClick={() => onClick().then(() => setIsUnread(false))}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0 flex flex-row gap-3 items-center">
          
          {/* Read Indicator*/}
          <button
            className={`rounded-xl w-4.5 h-4.5 hover:bg-gray-200 transition -m-1.5 p-1.5`}
            onClick={(e) => {e.stopPropagation(); toggleRead();}}
            title={isUnread ? "Mark Read" : "Mark Unread"}
          >
            <div className={`rounded-xl w-1.5 h-1.5 ${isUnread ? "bg-brand-red" : "bg-gray-300"}`}></div>
          </button>

          {/* From */}
          <h4 className={`font-${isUnread ? "semibold" : "normal"} text-sm text-gray-800 truncate`}>
            {thread.people.join(", ")}
          </h4>

          {/* Message Count */}
          {thread.messages.length > 1 &&
            <span className="text-sm text-gray-500 text-nowrap">{thread.messages.length}</span>
          }

        </div>

        {/* Time Ago*/}
        <span className="text-xs text-gray-500 text-nowrap">{timeAgo.format(new Date(thread.date))}</span>

      </div>

      {/* Snippet */}
      <div className="text-gray-600 text-sm flex flex-row gap-3 items-center truncate">
        <div className={`rounded-xl w-1.5 h-1.5`}></div>
        {thread.snippet}
      </div>
    </article>
  );
}

function MessageView({ message, loading }: { message: MailMessage, loading: boolean }) {
  return (
    <article
      key={message.id}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex flex-col mb-2 gap-0">
        <div className="flex items-center justify-between gap-3">

          {/* From */}
          <div className="min-w-0 flex flex-row gap-3 items-center">
            <h4 className="font-semibold text-sm text-gray-800 truncate">
              {message.fromSelf ? "You" : message.fromName || message.fromEmail}
            </h4>
          </div>

          {/* Date */}
          <span className="text-xs text-gray-500 text-nowrap">{
            new Intl.DateTimeFormat("en-us", { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.date))
          }</span>

        </div>

        {/* From Email*/}
        {(message.fromName || message.fromSelf) &&
          <span className="text-xs text-gray-500 truncate">{message.fromEmail}</span>
        }
      </div>

      {/* Body */}
      <div className="text-gray-700 text-sm flex flex-row gap-3 items-center">
        {loading ? "Loading..." : message.body || message.snippet}
      </div>

    </article>
  );
}