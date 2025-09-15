import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_USER_BY_USERNAME, CREATE_USER } from '../graphql/queries';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');

  const [getUserByUsername, { loading: loadingUser }] = useLazyQuery(
    GET_USER_BY_USERNAME,
    {
      onCompleted: (data) => {
        if (data.userByUsername) {
          onLogin(data.userByUsername);
        } else {
          setError('User not found');
          setIsNewUser(true);
        }
      },
      onError: () => {
        setError('User not found');
        setIsNewUser(true);
      },
    }
  );

  const [createUser, { loading: loadingCreate }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      onLogin(data.createUser);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (isNewUser) {
      if (!email.trim()) {
        setError('Email is required for new users');
        return;
      }
      createUser({
        variables: {
          createUserInput: {
            username: username.trim(),
            email: email.trim(),
            displayName: displayName.trim() || null,
          },
        },
      });
    } else {
      getUserByUsername({ variables: { username: username.trim() } });
    }
  };

  const loading = loadingUser || loadingCreate;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Chat App
        </Typography>
        <Typography variant="h6" gutterBottom align="center">
          {isNewUser ? 'Create Account' : 'Login'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />

          {isNewUser && (
            <>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Display Name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                margin="normal"
                disabled={loading}
              />
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              isNewUser ? 'Create Account' : 'Login'
            )}
          </Button>

          {isNewUser && (
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setIsNewUser(false);
                setError('');
              }}
              disabled={loading}
            >
              Back to Login
            </Button>
          )}
        </form>
      </Paper>
    </Box>
  );
};