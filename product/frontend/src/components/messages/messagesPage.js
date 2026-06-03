"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Image,
  MessageCircle,
  Mic,
  Search,
  Send,
  Square,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  findOrCreateDirectConversation,
  getConversationMessages,
  markConversationRead,
  sendAudioMessage,
  sendImageMessage,
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

function getMessagePreview(message) {
  if (!message) return "No messages yet";

  if (message.kind === "AUDIO") return "Voice message";
  if (message.kind === "IMAGE") return "Photo";

  return message.body || "No messages yet";
}

async function uploadToCloudinary(file, resourceType) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "kumasocialmedia");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.secure_url;
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

export default function MessagesPage({
  initialConversations,
  initialConversationId,
  userId,
}) {
  const [conversations, setConversations] = useState(
    sortConversations(initialConversations || [])
  );
  const [activeConversationId, setActiveConversationId] = useState(
    Number.isInteger(initialConversationId)
      ? initialConversationId
      : initialConversations?.[0]?.id || null
  );
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [draft, setDraft] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [recordingState, setRecordingState] = useState("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingConversationId, setTypingConversationId] = useState(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const previousScrollStateRef = useRef({
    conversationId: activeConversationId,
    messageCount: 0,
  });
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingCancelledRef = useRef(false);
  const recordingStartedAtRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === activeConversationId
      ) || null,
    [activeConversationId, conversations]
  );

  const canSend =
    Boolean(activeConversationId) &&
    (Boolean(draft.trim()) ||
      Boolean(selectedImage) ||
      Boolean(recordedAudio)) &&
    !isSendingMedia;

  const scrollToLatestMessage = (behavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    });
  };

  const updateConversationWithMessage = (message) => {
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message]
    );
    setConversations((current) =>
      sortConversations(
        current.map((conversation) =>
          conversation.id === message.conversationId
            ? { ...conversation, latestMessage: message, unreadCount: 0 }
            : conversation
        )
      )
    );
    notifyMessageStateChanged();
  };

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
    if (!activeConversationId || isLoadingMessages) {
      return;
    }

    const previous = previousScrollStateRef.current;
    const conversationChanged = previous.conversationId !== activeConversationId;
    const messageAdded = messages.length > previous.messageCount;

    if (conversationChanged || messageAdded) {
      scrollToLatestMessage(conversationChanged ? "auto" : "smooth");
    }

    previousScrollStateRef.current = {
      conversationId: activeConversationId,
      messageCount: messages.length,
    };
  }, [activeConversationId, isLoadingMessages, messages.length]);

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

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    resizeComposer();
  }, [draft]);

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

  const resizeComposer = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 64)}px`;
  };

  const handleComposerKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSendMessage(event);
  };

  const handleImageSelected = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImage(null);
    setSelectedImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      console.error("Audio recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recordingCancelledRef.current = false;
      recordingStartedAtRef.current = Date.now();
      setRecordedAudio(null);
      setRecordingSeconds(0);
      setRecordingState("recording");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        if (recordingCancelledRef.current) {
          return;
        }

        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const durationMs = recordingStartedAtRef.current
          ? Date.now() - recordingStartedAtRef.current
          : 0;

        setRecordedAudio({ blob, durationMs });
        setRecordingState("ready");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((Date.now() - recordingStartedAtRef.current) / 1000);
      }, 250);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      setRecordingState("idle");
    }
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    recordingCancelledRef.current = true;
    setRecordedAudio(null);
    setRecordingSeconds(0);
    stopRecording();
    setTimeout(() => setRecordingState("idle"), 0);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const body = draft;
    const imageFile = selectedImage;
    const audio = recordedAudio;

    try {
      setIsSendingMedia(true);

      let message;

      if (imageFile) {
        const imageUrl = await uploadToCloudinary(imageFile, "image");
        message = await sendImageMessage(activeConversationId, imageUrl, body);
        clearSelectedImage();
      } else if (audio) {
        const audioFile = new File([audio.blob], "voice-message.webm", {
          type: audio.blob.type || "audio/webm",
        });
        const audioUrl = await uploadToCloudinary(audioFile, "video");
        message = await sendAudioMessage(
          activeConversationId,
          audioUrl,
          audio.durationMs
        );
        setRecordedAudio(null);
        setRecordingState("idle");
        setRecordingSeconds(0);
      } else {
        message = await sendMessage(activeConversationId, body);
      }

      setDraft("");
      updateConversationWithMessage(message);
    } catch (error) {
      console.error("Error sending message:", error);
      setDraft(body);
    } finally {
      setIsSendingMedia(false);
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
            <div className="mt-4 flex h-10 items-center gap-2 rounded-full bg-slate-100 px-3 text-slate-500 focus-within:border focus-within:border-[#FF4E01] focus-within:ring-2 focus-within:ring-[#FF4E01]/30">
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
                      {getMessagePreview(conversation.latestMessage)}
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
                            className={`max-w-[78%] rounded-2xl border-2 px-4 py-2 text-sm shadow-md ${
                              isMine
                                ? "rounded-br-sm border-orange-700 bg-[#FF4E01] text-white"
                                : "rounded-bl-sm border-orange-200 bg-slate-50 text-slate-900"
                            }`}
                          >
                            {message.kind === "IMAGE" && message.imageUrl ? (
                              <div className="space-y-2">
                                <img
                                  src={message.imageUrl}
                                  alt={message.body || "Message image"}
                                  onLoad={() => scrollToLatestMessage("smooth")}
                                  className="max-h-80 rounded-xl border border-orange-100 object-cover"
                                />
                                {message.body ? (
                                  <p className="whitespace-pre-wrap break-words">
                                    {message.body}
                                  </p>
                                ) : null}
                              </div>
                            ) : message.kind === "AUDIO" && message.audioUrl ? (
                              <audio
                                controls
                                src={message.audioUrl}
                                className="h-10 max-w-full"
                              />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">
                                {message.body}
                              </p>
                            )}
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
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t border-orange-100 bg-white p-3"
              >
                {selectedImagePreview && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-orange-100 bg-slate-50 p-2 shadow-md">
                    <img
                      src={selectedImagePreview}
                      alt="Selected upload"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                      {selectedImage?.name}
                    </span>
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#FF4E01] hover:bg-orange-50"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {recordingState !== "idle" && (
                  <div className="mb-3 flex items-center gap-2 rounded-2xl border border-orange-100 bg-slate-50 p-2 text-sm shadow-md">
                    <span className="h-2 w-2 rounded-full bg-[#FF4E01]" />
                    <span className="flex-1 text-slate-700">
                      {recordingState === "recording"
                        ? `Recording ${Math.floor(recordingSeconds)}s`
                        : `Voice message ${Math.floor(recordingSeconds)}s`}
                    </span>
                    {recordingState === "recording" ? (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#FF4E01] hover:bg-orange-50"
                        title="Stop recording"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                    ) : (
                      <Check className="h-4 w-4 text-[#FF4E01]" />
                    )}
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                      title="Cancel recording"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-orange-100 bg-slate-50 text-[#FF4E01] shadow-md hover:bg-orange-50"
                    title="Add image"
                  >
                    <Image className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={recordingState === "recording"}
                    className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-orange-100 bg-slate-50 text-[#FF4E01] shadow-md hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Record voice message"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={handleDraftChange}
                    onKeyDown={handleComposerKeyDown}
                    rows={1}
                    maxLength={2000}
                    placeholder="Write a message"
                    className="max-h-16 min-h-11 flex-1 resize-none overflow-y-auto rounded-2xl border border-orange-100 bg-slate-50 px-4 py-3 text-sm text-slate-950 shadow-md outline-none placeholder:text-slate-400 focus:border-[#FF4E01] focus:ring-2 focus:ring-[#FF4E01]/30"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#FF4E01] text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                    title="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
