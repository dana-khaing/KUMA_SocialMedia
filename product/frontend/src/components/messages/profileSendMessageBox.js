"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { findOrCreateDirectConversation } from "@/lib/messageAction";

function getDisplayName(user) {
  return (
    [user?.name, user?.surname].filter(Boolean).join(" ") ||
    user?.username ||
    "KUMA User"
  );
}

export default function ProfileSendMessageBox({ user }) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenConversation = async () => {
    if (!user?.id || isOpening) {
      return;
    }

    setIsOpening(true);

    try {
      const conversation = await findOrCreateDirectConversation(user.id);
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error opening profile conversation:", error);
      setIsOpening(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border-[1px] border-orange-100 bg-slate-50 p-4 text-sm shadow-md">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#FF4E01] shadow">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-950">
            {getDisplayName(user)}
          </p>
          <p className="truncate text-xs text-slate-500">@{user?.username}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleOpenConversation}
        disabled={isOpening}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#FF4E01] px-4 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {isOpening ? "Opening" : "Send message"}
      </button>
    </div>
  );
}
