import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../graphql/queries';
import { User } from '../types';

interface CreateChatDialogProps {
  open: boolean;
  currentUser: User;
  onClose: () => void;
  onCreateChat: (name: string, participants: string[]) => void;
  loading?: boolean;
}

export const CreateChatDialog: React.FC<CreateChatDialogProps> = ({
  open,
  currentUser,
  onClose,
  onCreateChat,
  loading = false,
}) => {
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: usersData, loading: loadingUsers } = useQuery(GET_USERS);

  const availableUsers = (usersData?.users || []).filter(
    (user: User) => user.id !== currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatName.trim()) {
      const participants = [currentUser.id, ...selectedUsers.map(user => user.id)];
      onCreateChat(chatName.trim(), participants);
      setChatName('');
      setSelectedUsers([]);
    }
  };

  const handleClose = () => {
    setChatName('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Chat</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Chat Name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />

          <Autocomplete
            multiple
            options={availableUsers}
            getOptionLabel={(option) => option.displayName || option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            loading={loadingUsers}
            disabled={loading}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option.displayName || option.username}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Participants"
                placeholder="Select users to add to chat"
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              You will be automatically added to the chat.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selected participants: {selectedUsers.length + 1} (including you)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!chatName.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Chat'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};