import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Chat, User } from '../types';

interface ChatListProps {
  chats: Chat[];
  currentUser: User;
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentUser,
  selectedChatId,
  onChatSelect,
}) => {
  const formatParticipants = (chat: Chat) => {
    const otherParticipants = chat.participantUsers?.filter(
      (user) => user.id !== currentUser.id
    );
    return otherParticipants?.map((user) => user.displayName || user.username).join(', ') || '';
  };

  return (
    <List>
      {chats.map((chat) => (
        <ListItem key={chat.id} disablePadding>
          <ListItemButton
            selected={selectedChatId === chat.id}
            onClick={() => onChatSelect(chat.id)}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">{chat.name}</Typography>
                  <Chip
                    label={chat.participants.length}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {formatParticipants(chat) || 'No other participants'}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
      {chats.length === 0 && (
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="body2" color="text.secondary" align="center">
                No chats available. Create a new chat to get started.
              </Typography>
            }
          />
        </ListItem>
      )}
    </List>
  );
};