import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { canAccessContent, getUserType } from '@/lib/auth-utils';
import { GuestAccessBanner } from '@/components/guest-access-banner';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  // Check if user can access this chat
  if (!canAccessContent(session, chat.visibility, chat.userId)) {
    notFound();
  }

  const userType = getUserType(session);
  const isOwner = session?.user?.id === chat.userId;
  const isReadonly = !session?.user || !isOwner;

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={isReadonly}
          session={session}
          autoResume={true}
          userType={userType}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <GuestAccessBanner 
        userType={userType} 
        contentType="chat" 
        className="mx-4 mt-4" 
      />
      <div className="flex-1">
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={chatModelFromCookie.value}
          initialVisibilityType={chat.visibility}
          isReadonly={isReadonly}
          session={session}
          autoResume={true}
          userType={userType}
        />
      </div>
      <DataStreamHandler id={id} />
    </div>
  );
}
