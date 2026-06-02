import { auth } from "@clerk/nextjs/server";
import MessagesPage from "@/components/messages/messagesPage";
import { listMessageConversations } from "@/lib/messageAction";
import BetaDatabaseFallback from "@/components/common/betaDatabaseFallback";
import { isDatabaseUnavailableError } from "@/lib/databaseStatus";

export default async function Messages({ searchParams }) {
  const { userId } = await auth();
  const params = await searchParams;
  const requestedConversationId = Number(params?.conversation);
  const initialConversationId = Number.isInteger(requestedConversationId)
    ? requestedConversationId
    : null;

  if (!userId) {
    return null;
  }

  try {
    const conversations = await listMessageConversations();

    return (
      <MessagesPage
        initialConversations={conversations}
        initialConversationId={initialConversationId}
        userId={userId}
      />
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return <BetaDatabaseFallback />;
    }

    throw error;
  }
}
