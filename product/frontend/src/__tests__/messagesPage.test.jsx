/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MessagesPage from "@/components/messages/messagesPage";
import {
  getConversationMessages,
  markConversationRead,
  sendMessage,
  sendTypingEvent,
} from "@/lib/messageAction";

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/lib/messageAction", () => ({
  findOrCreateDirectConversation: jest.fn(),
  getConversationMessages: jest.fn(),
  markConversationRead: jest.fn(),
  searchMessageUsers: jest.fn(),
  sendAudioMessage: jest.fn(),
  sendImageMessage: jest.fn(),
  sendMessage: jest.fn(),
  sendTypingEvent: jest.fn(),
}));

jest.mock("@/lib/pusherClient", () => ({
  subscribeToMessageEvents: jest.fn(() => jest.fn()),
}));

jest.mock("@/components/navbar/messageBadge", () => ({
  MESSAGE_CHANGED_EVENT: "kuma:messages-changed",
}));

const baseConversation = {
  id: 10,
  updatedAt: "2026-06-02T10:00:00.000Z",
  participant: {
    id: "user-2",
    username: "dana",
    name: "Dana",
    surname: "K",
    avatar: null,
  },
  latestMessage: {
    id: 4,
    conversationId: 10,
    senderId: "user-2",
    kind: "TEXT",
    body: "Hi",
    createdAt: "2026-06-02T10:00:00.000Z",
  },
  unreadCount: 0,
};

function renderMessagesPage(conversations = [baseConversation]) {
  return render(
    <MessagesPage
      initialConversations={conversations}
      initialConversationId={conversations[0]?.id}
      userId="user-1"
    />
  );
}

describe("MessagesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConversationMessages.mockResolvedValue([]);
    markConversationRead.mockResolvedValue({ success: true });
    sendTypingEvent.mockResolvedValue({ success: true });
    sendMessage.mockResolvedValue({
      id: 5,
      conversationId: 10,
      senderId: "user-1",
      kind: "TEXT",
      body: "Hello",
      createdAt: "2026-06-02T10:02:00.000Z",
    });
  });

  it("sends with Enter and leaves Shift+Enter for multiline text", async () => {
    renderMessagesPage();

    const textarea = screen.getByPlaceholderText("Write a message");
    fireEvent.change(textarea, { target: { value: "Hello" } });

    expect(
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true })
    ).toBe(true);
    expect(sendMessage).not.toHaveBeenCalled();

    expect(fireEvent.keyDown(textarea, { key: "Enter" })).toBe(false);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith(10, "Hello");
    });
  });

  it("shows media preview labels in the conversation list", () => {
    renderMessagesPage([
      {
        ...baseConversation,
        id: 11,
        latestMessage: {
          ...baseConversation.latestMessage,
          conversationId: 11,
          kind: "AUDIO",
          body: "",
        },
      },
      {
        ...baseConversation,
        id: 12,
        participant: { ...baseConversation.participant, id: "user-3" },
        latestMessage: {
          ...baseConversation.latestMessage,
          conversationId: 12,
          kind: "IMAGE",
          body: "caption",
        },
      },
    ]);

    expect(screen.getByText("Voice message")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
  });
});
