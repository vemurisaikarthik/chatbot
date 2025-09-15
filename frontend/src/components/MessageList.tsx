import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
} from '@mui/material';
import { Message, User } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageDisplayName = (message: Message) => {
    return message.user?.displayName || message.user?.username || 'Unknown User';
  };

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {messages.map((message) => {
        const isOwnMessage = message.userId === currentUser.id;
        const displayName = getMessageDisplayName(message);

        return (
          <Box
            key={message.id}
            display="flex"
            justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
            alignItems="flex-start"
            gap={1}
          >
            {!isOwnMessage && (
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
                color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
              }}
            >
              {!isOwnMessage && (
                <Typography variant="caption" display="block" sx={{ mb: 0.5, opacity: 0.8 }}>
                  {displayName}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                {message.content}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {formatTime(message.createdAt)}
              </Typography>
            </Paper>
            {isOwnMessage && (
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {currentUser.displayName?.charAt(0).toUpperCase() ||
                 currentUser.username.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>
        );
      })}
      {messages.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography variant="body2" color="text.secondary">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
};