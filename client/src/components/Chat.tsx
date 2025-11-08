import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Message from './Message';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useEditMessage,
  useGetMessagesInfinite,
  useNewMessage,
  useReactMessage,
} from '../hooks/useMessages';
import { BiArrowBack } from 'react-icons/bi';
import NewMessageInputForm from './NewMessageInputForm';
import { MdVerified } from 'react-icons/md';
import { useQueryClient } from '@tanstack/react-query';
import { FiPhone, FiMoreVertical } from 'react-icons/fi';
import { useCall } from '../hooks/useCall';
const Chat = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const state = useLocation().state as ConversationState;
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);
  const [messageToReply, setMessageToReply] = useState<Message | null>(null);
  const [imgBase64, setImgBase64] = useState('');
  const [showMoreClicked, setShowMoreClicked] = useState(false);

  const LIMIT = 20;
  const { data: messages, fetchNextPage } = useGetMessagesInfinite(
    parseInt(conversationId!),
    LIMIT,
  );

  // Conversations metadata from cache
  const queryClient = useQueryClient();
  const conversations = queryClient.getQueryData<Conversation[]>([
    'conversations',
  ]);
  const conversationMeta = conversations?.find(
    (c) => c.id === parseInt(conversationId!),
  );
  const isGroup = conversationMeta?.isGroup ?? false;
  const participants = conversationMeta?.participants ?? [];

  const conversationWithSelf =
    (conversationMeta?.participants?.length === 1 &&
      conversationMeta.participants[0].id === currentUser?.id) ||
    false;

  const recipientIds = conversationWithSelf
    ? [currentUser!.id]
    : (conversationMeta?.participants || [])
        .map((p) => p.id)
        .filter((id) => id !== currentUser?.id);

  const { mutate: newMessage, isSuccess: messageHasBeenSent } = useNewMessage(
    parseInt(conversationId!),
    recipientIds,
    message,
    imgBase64,
    messageToReply?.id,
  );

  const { mutate: editMessage, isSuccess: messageHasBeenUpdated } =
    useEditMessage(parseInt(conversationId!));

  const { mutate: reactToMessage } = useReactMessage(
    parseInt(conversationId!),
    currentUser!.id,
    recipientIds[0] ?? state?.recipient.id,
  );

  useEffect(() => {
    setMessage(() => {
      if (messageToEdit?.message) return messageToEdit.message;
      return '';
    });
    inputRef.current?.focus();
  }, [messageToEdit]);

  useEffect(() => {
    if (messageToReply) {
      inputRef.current?.focus();
    }
  }, [messageToReply]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === '' && imgBase64 === '') {
      setMessage('');
      return;
    }
    newMessage();
  };

  const updateMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === '' || !messageToEdit?.id) {
      setMessage('');
      return;
    }
    editMessage({ messageId: messageToEdit.id, message });
  };

  useEffect(() => {
    setMessage('');
    setImgBase64('');
    setMessageToEdit(null);
    setMessageToReply(null);
    inputRef.current?.focus();
  }, [conversationId]);

  useEffect(() => {
    if (messagesContainerRef.current && !showMoreClicked) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    } else if (showMoreClicked) {
      setShowMoreClicked(false);
    }
  }, [messages]);

  useEffect(() => {
    setMessage('');
    setMessageToEdit(null);
    setMessageToReply(null);
    setImgBase64('');
  }, [messageHasBeenSent, messageHasBeenUpdated]);

  const handleAddReaction = (messageId: number, emoji: string) => {
    reactToMessage({ messageId, emoji });
  };

  const {
    startCall,
    isCalling,
    isInCall,
    remoteStreams,
    localStream,
    onIncomingCall,
    acceptCall,
    endCall,
  } = useCall({
    currentUserId: currentUser!.id,
    recipientIds,
    conversationId: conversationId!,
  });
  useEffect(() => {
    onIncomingCall((data) => {
      if (confirm(`Cuộc gọi từ ${data.fromUserId}. Chấp nhận?`)) {
        acceptCall();
      }
    });
  }, [onIncomingCall, acceptCall]);
  const startVideoCall = async () => {
    try {
      await startCall(); // ĐÃ CÓ TẤT CẢ: socket, stream, offer, ICE
      console.log('Video call started!');
    } catch (err) {
      console.error('Failed to start call:', err);
    }
  };

  const openConversationMenu = () => {
    // Mở menu: xóa, chặn, báo cáo...
  };

  return (
    <div className="flex flex-col h-[calc(100svh)] min-w-0">
      {/* Header bar */}
      <div className="flex-none flex items-center gap-3 py-2 px-5 sm:px-10 border-b border-b-neutral-200 dark:border-b-neutral-800 min-w-0">
        <button
          className="hover:bg-neutral-200 h-11 aspect-square flex items-center justify-center rounded-full p-2.5 sm:hidden dark:text-white dark:hover:bg-neutral-800"
          onClick={() => navigate(-1)}
        >
          <BiArrowBack size={'100%'} />
        </button>
        <button
          type="button"
          onClick={() => navigate(`/${conversationId}/info`)}
          className="text-left text-2xl dark:text-white grid grid-flow-col items-center gap-2 min-w-0 hover:underline py-[0.375rem]"
          aria-label="Open conversation info"
        >
          {state?.recipient.conversationWithSelf ? (
            <>
              <p className="truncate">Note to self</p>
              <span className="text-blue-600">
                <MdVerified />
              </span>
            </>
          ) : isGroup ? (
            <span className="truncate">
              {conversationMeta?.title ||
                participants.map((p) => p.display_name).join(', ')}
            </span>
          ) : (
            state?.recipient.title
          )}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          {/* Icon gọi điện */}
          <button
            onClick={startVideoCall}
            disabled={isCalling || isInCall}
            className={`p-2 rounded-full transition-colors ${
              isCalling || isInCall
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            title="Gọi video"
          >
            <FiPhone className="w-5 h-5" />
            {isCalling && <span className="ml-2">Đang gọi...</span>}
          </button>

          {/* Icon menu 3 chấm */}
          <button
            onClick={() => openConversationMenu()}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            aria-label="More options"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full flex flex-col justify-end">
        <div
          ref={messagesContainerRef}
          className="grid gap-2 p-2 overflow-y-auto"
        >
          {messages?.pages &&
            messages.pages.length > 0 &&
            (messages.pages[messages.pages.length - 1]?.length ?? 0) >=
              LIMIT && (
              <button
                onClick={() => {
                  setShowMoreClicked(true);
                  fetchNextPage();
                }}
                className="cursor-pointer w-fit px-2 py-1 text-blue-600 hover:underline mx-auto"
              >
                Show More
              </button>
            )}
          {(() => {
            const orderedMessages: Message[] =
              messages?.pages
                .slice()
                .reverse()
                .flatMap((page) => page.slice().reverse()) ?? [];

            const getAuthorInfo = (authorId: number) => {
              if (authorId === currentUser?.id) {
                return {
                  display_name: currentUser.display_name,
                  profile_picture: currentUser.profile_picture,
                };
              }
              const found = participants.find((p) => p.id === authorId);
              return {
                display_name: found?.display_name,
                profile_picture: found?.profile_picture,
              };
            };

            return orderedMessages.map((m, idx) => {
              const prev = idx > 0 ? orderedMessages[idx - 1] : undefined;
              const showAuthorHeader =
                isGroup &&
                m.authorId !== currentUser?.id &&
                (!prev || prev.authorId !== m.authorId);
              const authorInfo = getAuthorInfo(m.authorId);
              const next =
                idx < orderedMessages.length - 1
                  ? orderedMessages[idx + 1]
                  : undefined;
              const FIVE_MINUTES_MS = 5 * 60 * 1000;
              const showTimestamp =
                !next ||
                next.authorId !== m.authorId ||
                new Date(next.created_at).getTime() -
                  new Date(m.created_at).getTime() >
                  FIVE_MINUTES_MS;
              return (
                <Message
                  key={m.id}
                  message={m}
                  isCurrentUser={m.authorId === currentUser?.id}
                  setMessageToEdit={setMessageToEdit}
                  setMessageToReply={setMessageToReply}
                  addReaction={handleAddReaction}
                  showAuthorHeader={showAuthorHeader}
                  authorDisplayName={authorInfo.display_name}
                  authorProfilePicture={authorInfo.profile_picture}
                  showTimestamp={showTimestamp}
                />
              );
            });
          })()}
        </div>
      </div>

      {conversationId && (
        <NewMessageInputForm
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onSubmit={messageToEdit !== null ? updateMessage : sendMessage}
          messageToEdit={messageToEdit}
          setMessageToEdit={setMessageToEdit}
          messageToReply={messageToReply}
          setMessageToReply={setMessageToReply}
          inputRef={inputRef}
          imgBase64={imgBase64}
          setImgBase64={setImgBase64}
        />
      )}
      {isInCall && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          {/* Local video */}
          {localStream.length > 0 && (
            <video
              autoPlay
              muted
              playsInline
              ref={(video) =>
                video && (video.srcObject = new MediaStream(localStream))
              }
              className="w-40 h-40 rounded-full object-cover absolute bottom-4 right-4 border-4 border-white"
            />
          )}

          {/* Remote videos */}
          {remoteStreams.map((stream) => (
            <video
              key={stream.id}
              autoPlay
              playsInline
              ref={(video) => video && (video.srcObject = stream)}
              className="w-full h-full object-cover"
            />
          ))}

          <button
            onClick={endCall}
            className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full"
          >
            Kết thúc
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
