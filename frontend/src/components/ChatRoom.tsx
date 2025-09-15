import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { People as PeopleIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_CHAT,
  SEND_MESSAGE,
  MESSAGE_ADDED_SUBSCRIPTION,
} from '../graphql/queries';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { User, Message } from '../types';

interface ChatRoomProps {
  chatId: string;
  currentUser: User;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ chatId, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_CHAT, {
    variables: { id: chatId },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data.chat?.messages) {
        setMessages(data.chat.messages);
      }
    },
  });

  // Clear messages when chatId changes to prevent showing old messages
  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatId },
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData.data?.messageAdded) {
        const newMessage = subscriptionData.data.messageAdded;
        setMessages((prev) => {
          if (!prev.some((msg) => msg.id === newMessage.id)) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  });

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage({
        variables: {
          createMessageInput: {
            content,
            chatId,
            userId: currentUser.id,
          },
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const chat = data?.chat;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={2}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Failed to load chat: {error.message}
          <Box mt={1}>
            <IconButton onClick={() => refetch()} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!chat) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="text.secondary">Chat not found</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{chat.name}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Participants">
              <Chip
                icon={<PeopleIcon />}
                label={chat.participants.length}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {chat.participantUsers
            ?.map((user: User) => user.displayName || user.username)
            .join(', ')}
        </Typography>
      </Box>

      <MessageList messages={messages} currentUser={currentUser} />

      <Box sx={{ p: 1, bgcolor: 'background.default' }}>
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendingMessage}
        />
      </Box>
    </Box>
  );
};