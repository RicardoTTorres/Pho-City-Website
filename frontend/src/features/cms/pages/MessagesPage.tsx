import { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/shared/components/ui/button"
import { Reply as ReplyIcon, Send } from "lucide-react";

import {
  type MailMessage, type MailThread,
  getState, getThreads, getThread, markRead, markUnread, reply, getSavedThreads, deleteThread
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
  const [customersOnly, setCustomersOnly] = useState<boolean>(false);
  // Mobile: 'list' shows thread list, 'thread' shows open thread
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');

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
    window.open(`${API_URL}/api/admin/mail/oauth/init`, "googleAuth", "width=500,height=600");
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
      if (thread !== undefined) setMobileView('thread');

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
        const threadFull = await getThread(thread.id);
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

  async function handleDelete(threadId: string) {
    try {
      await deleteThread(threadId);
      setThreadsData(prev => prev?.filter(t => t.id !== threadId));
      if (openThread?.id === threadId) setOpenThread(undefined);
    } catch (err) {
      console.error(err);
    }
  }

  const visibleThreads = customersOnly
    ? threadsData?.filter(t => t.people.some(p => p !== "You"))
    : threadsData;

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-800">Could not load messages</p>
        <p className="text-xs text-gray-500">Check your connection and try refreshing the page.</p>
        <button onClick={refresh} className="mt-1 text-xs px-3 py-1.5 rounded-md bg-brand-red text-white hover:bg-brand-red/90 transition">
          Retry
        </button>
      </div>
    );
  }

  if (authenticated === undefined || threadsData === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 h-[calc(100vh-120px)] -my-6 -mx-3">

      {/* Left: thread list — hidden on mobile when a thread is open */}
      <div className={`${mobileView === 'thread' ? 'hidden lg:flex' : 'flex'} flex-col overflow-y-auto py-6 px-3 gap-2.5`}>
        <div className="flex items-center gap-2 pb-1 shrink-0">
          <button
            onClick={() => setCustomersOnly(prev => !prev)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              customersOnly
                ? "bg-brand-red text-white border-brand-red"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Customers only
          </button>
        </div>

        <div className="space-y-2.5">
          {visibleThreads?.map((thread) => (
            <ThreadPreview key={thread.id} thread={thread} selected={thread.id === openThread?.id} onClick={() => switchThread(thread)} {...(thread.isGmail ? { onDelete: handleDelete } : {})} />
          ))}
          {visibleThreads?.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
          )}
        </div>

        {nextPageToken && (
          <div className="flex items-center justify-center py-1 shrink-0">
            <button className="text-sm px-6 py-2 rounded-md bg-brand-red text-white shadow-md" onClick={loadMore}>
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Right: selected conversation — hidden on mobile when no thread is open */}
      <div className={`${mobileView === 'list' ? 'hidden lg:block' : 'block'} overflow-y-auto py-6 px-3`}>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-h-full">

          {/* Mobile back button */}
          {openThread && (
            <button
              onClick={() => { setMobileView('list'); setOpenThread(undefined); }}
              className="lg:hidden flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-4 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to messages
            </button>
          )}

          {!(openThread?.messages) ? (
            authenticated ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-sm text-gray-400">Select a conversation to read it</p>
              </div>
            ) : (
              <div className="space-y-4 p-2">
                <h2 className="text-base font-semibold text-gray-800">Gmail Not Connected</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Connect your Gmail account to view contact form submissions, direct emails,
                  and full reply chains in one place.
                  {email && <> You will be signing in as <strong>{email}</strong>.</>}
                </p>
                <Button onClick={startAuth}>Authenticate with Google</Button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="space-y-3">
                {openThread.messages.map((message) => (
                  <MessageView key={message.id} message={message} loading={openThreadLoading} />
                ))}
              </div>

              {!replying ? (
                <button onClick={() => setReplying(true)} className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                  <ReplyIcon size={20} /> Reply
                </button>
              ) : (
                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red/40"
                    placeholder="Write a reply..."
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={!replyText.trim()}
                      className="inline-flex items-center gap-1 bg-brand-red text-white text-xs px-3 py-1.5 rounded-md hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={14} /> Send
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplying(false); setReplyText(""); }}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                  {replyError && (
                    <span className={`text-xs mt-1 block ${replyError === 'Sending...' ? 'text-gray-400' : 'text-red-500'}`}>
                      {replyError}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadPreview({ thread, onClick, selected, onDelete }: { thread: MailThread, onClick: () => Promise<void>, selected?: boolean, onDelete?: (id: string) => Promise<void> }) {
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
            className={`rounded-xl w-5 h-5 hover:bg-gray-200 transition -m-1.5 p-1.5`}
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

        <div className="flex items-center gap-2 shrink-0">
          {/* Time Ago*/}
          <span className="text-xs text-gray-500 text-nowrap">{timeAgo.format(new Date(thread.date))}</span>

          {/* Delete */}
          {onDelete &&
            <button
              className="text-gray-400 hover:text-red-500 transition p-1 rounded"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(thread.id); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          }
        </div>

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