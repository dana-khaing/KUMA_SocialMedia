"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import {
  findOrCreateDirectConversation,
  getConversationMessages,
  markConversationRead,
  searchMessageUsers,
  sendMessage,
  sendTypingEvent,
} from "@/lib/messageAction";
import { subscribeToMessageEvents } from "@/lib/pusherClient";
import { MESSAGE_CHANGED_EVENT } from "@/components/navbar/messageBadge";

function getDisplayName(user) {
  if (!user) return "KUMA User";

  return (
    [user.name, user.surname].filter(Boolean).join(" ") ||
    user.username ||
    "KUMA User"
  );
}

function formatTime(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function sortConversations(conversations) {
  return [...conversations].sort((a, b) => {
    const aTime = new Date(a.latestMessage?.createdAt || a.updatedAt).getTime();
    const bTime = new Date(b.latestMessage?.createdAt || b.updatedAt).getTime();

    return bTime - aTime;
  });
}

function notifyMessageStateChanged() {
  window.dispatchEvent(new Event(MESSAGE_CHANGED_EVENT));
}

function Avatar({ user, size = "md" }) {
  const sizeClass = size === "lg" ? "h-12 w-12" : "h-10 w-10";

  return (
    <img
      src={user?.avatar || "/user-default.png"}
      alt={getDisplayName(user)}
      className={`${sizeClass} rounded-full border border-[#FF4E01]/30 bg-white object-cover`}
    />
  );
}

export default function MessagesPage({ initialConversations, userId }) {
  const [conversations, setConversations] = useState(
    sortConversations(initialConversations || [])
  );
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversations?.[0]?.id || null
  );
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingConversationId, setTypingConversationId] = useState(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId
      ) || null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const users = await searchMessageUsers(trimmedQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Error searching message users:", error);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let active = true;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const conversationMessages = await getConversationMessages(
          activeConversationId
        );
        await markConversationRead(activeConversationId);
        notifyMessageStateChanged();

        if (active) {
          setMessages(conversationMessages);
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === activeConversationId
                ? { ...conversation, unreadCount: 0 }
                : conversation
            )
          );
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        if (active) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [activeConversationId]);

  useEffect(() => {
    return subscribeToMessageEvents(userId, {
      onMessageCreated: (message) => {
        setConversations((current) =>
          sortConversations(
            current.map((conversation) => {
              if (conversation.id !== message.conversationId) {
                return conversation;
              }

              return {
                ...conversation,
                latestMessage: message,
                unreadCount:
                  message.conversationId === activeConversationId
                    ? 0
                    : conversation.unreadCount + 1,
              };
            })
          )
        );

        if (message.conversationId === activeConversationId) {
          setMessages((current) =>
            current.some((item) => item.id === message.id)
              ? current
              : [...current, message]
          );
          markConversationRead(activeConversationId).catch((error) => {
            console.error("Error marking realtime message read:", error);
          });
          notifyMessageStateChanged();
        }
      },
      onTyping: ({ conversationId }) => {
        setTypingConversationId(conversationId);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTypingConversationId(null);
        }, 1800);
      },
    });
  }, [activeConversationId, userId]);

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
  };

  const handleStartConversation = async (user) => {
    try {
      const conversation = await findOrCreateDirectConversation(user.id);
      setConversations((current) => {
        const existing = current.find((item) => item.id === conversation.id);

        if (existing) {
          return sortConversations(current);
        }

        return sortConversations([conversation, ...current]);
      });
      setActiveConversationId(conversation.id);
      setQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleDraftChange = (event) => {
    setDraft(event.target.value);

    if (!activeConversationId) {
      return;
    }

    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) {
      return;
    }

    lastTypingSentRef.current = now;
    sendTypingEvent(activeConversationId).catch((error) => {
      console.error("Error sending typing event:", error);
    });
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!activeConversationId || !draft.trim()) {
      return;
    }

    const body = draft;
    setDraft("");

    try {
      const message = await sendMessage(activeConversationId, body);
      setMessages((current) => [...current, message]);
      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === activeConversationId
              ? { ...conversation, latestMessage: message, unreadCount: 0 }
              : conversation
          )
        )
      );
      notifyMessageStateChanged();
    } catch (error) {
      console.error("Error sending message:", error);
      setDraft(body);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-3 lg:p-4">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-2xl border border-orange-100 bg-slate-50 shadow-md">
        <aside
          className={`w-full border-orange-100 bg-white lg:flex lg:w-[22rem] lg:flex-col lg:border-r ${
            activeConversation ? "hidden lg:flex" : "flex flex-col"
          }`}
        >
          <div className="border-b border-orange-100 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-950">Messages</h1>
              <MessageCircle className="h-5 w-5 text-[#FF4E01]" />
            </div>
            <div className="mt-4 flex h-10 items-center gap-2 rounded-full bg-slate-100 px-3 text-slate-500">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users"
                className="h-full flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="border-b border-orange-100 p-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleStartConversation(user)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-orange-50"
                >
                  <Avatar user={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {getDisplayName(user)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-slate-500">
                <UserRound className="mb-3 h-8 w-8 text-[#FF4E01]" />
                <p>Search for someone to start a conversation.</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
                    conversation.id === activeConversationId
                      ? "bg-orange-50"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Avatar user={conversation.participant} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {getDisplayName(conversation.participant)}
                      </p>
                      <span className="flex-shrink-0 text-xs text-slate-400">
                        {formatTime(conversation.latestMessage?.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {conversation.latestMessage?.body || "No messages yet"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF4E01] px-1 text-xs font-bold text-white">
                      {conversation.unreadCount > 99
                        ? "99+"
                        : conversation.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        <section
          className={`min-w-0 flex-1 bg-slate-50 ${
            activeConversation ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          }`}
        >
          {!activeConversation ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <MessageCircle className="mb-3 h-10 w-10 text-[#FF4E01]" />
              <p className="text-sm">Select a conversation.</p>
            </div>
          ) : (
            <>
              <div className="flex h-16 items-center gap-3 border-b border-orange-100 bg-white px-4">
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#FF4E01] hover:bg-orange-50 lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar user={activeConversation.participant} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {getDisplayName(activeConversation.participant)}
                  </p>
                  <Link
                    href={`/profile/${activeConversation.participant?.id}`}
                    className="text-xs text-[#FF4E01] hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                {isLoadingMessages ? (
                  <p className="text-center text-sm text-slate-500">
                    Loading messages...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">
                    Start the conversation.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => {
                      const isMine = message.senderId === userId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              isMine
                                ? "rounded-br-sm bg-[#FF4E01] text-white"
                                : "rounded-bl-sm bg-white text-slate-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {message.body}
                            </p>
                            <p
                              className={`mt-1 text-[0.68rem] ${
                                isMine ? "text-white/80" : "text-slate-400"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {typingConversationId === activeConversation.id && (
                  <p className="mt-3 text-xs text-slate-500">Typing...</p>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 border-t border-orange-100 bg-white p-3"
              >
                <textarea
                  value={draft}
                  onChange={handleDraftChange}
                  rows={1}
                  maxLength={2000}
                  placeholder="Write a message"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF4E01]/30"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#FF4E01] text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
