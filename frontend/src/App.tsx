import { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  IconButton,
  Alert,
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { LoginForm } from './components/LoginForm';
import { ChatList } from './components/ChatList';
import { ChatRoom } from './components/ChatRoom';
import { CreateChatDialog } from './components/CreateChatDialog';
import { useAuth } from './hooks/useAuth';
import { GET_CHATS_BY_USER, CREATE_CHAT } from './graphql/queries';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const DRAWER_WIDTH = 300;

function App() {
  const { currentUser, login, logout } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);

  const { data: chatsData, loading: loadingChats, refetch: refetchChats } = useQuery(
    GET_CHATS_BY_USER,
    {
      variables: { userId: currentUser?.id },
      skip: !currentUser,
      fetchPolicy: 'network-only',
    }
  );

  console.log(`chatsData`, chatsData);

  const [createChat, { loading: creatingChat }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      setCreateChatOpen(false);
      setSelectedChatId(data.createChat.id);
      refetchChats();
    },
    onError: (error) => {
      console.error('Error creating chat:', error);
    },
  });

  const handleCreateChat = (name: string, participants: string[]) => {
    createChat({
      variables: {
        createChatInput: {
          name,
          participants,
        },
      },
    });
  };

  const chats = chatsData?.chatsByUser || [];
  
  console.log('Current user:', currentUser);
  console.log('Loading chats:', loadingChats);
  console.log('Chats array:', chats);
  console.log('Chats length:', chats.length);

  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginForm onLogin={login} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { sm: `${DRAWER_WIDTH}px` },
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2, display: { sm: 'none' } }}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Chat App
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {currentUser.displayName || currentUser.username}
            </Typography>
            <Button
              color="inherit"
              onClick={logout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Chats</Typography>
            </Box>
            {loadingChats ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading chats...
                </Typography>
              </Box>
            ) : (
              <ChatList
                chats={chats}
                currentUser={currentUser}
                selectedChatId={selectedChatId}
                onChatSelect={(chatId) => {
                  setSelectedChatId(chatId);
                  setDrawerOpen(false);
                }}
              />
            )}
          </Box>
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Chats</Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loadingChats ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading chats...
                  </Typography>
                </Box>
              ) : (
                <ChatList
                  chats={chats}
                  currentUser={currentUser}
                  selectedChatId={selectedChatId}
                  onChatSelect={setSelectedChatId}
                />
              )}
            </Box>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { sm: `${DRAWER_WIDTH}px` },
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          }}
        >
          <Toolbar />
          {selectedChatId ? (
            <ChatRoom chatId={selectedChatId} currentUser={currentUser} />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height="100%"
              gap={2}
              p={2}
            >
              <Typography variant="h5" color="text.secondary" align="center">
                Welcome to Chat App
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Select a chat from the sidebar or create a new one to get started.
              </Typography>
              {chats.length === 0 && (
                <Alert severity="info" sx={{ maxWidth: 400 }}>
                  You haven't joined any chats yet. Create your first chat to begin!
                </Alert>
              )}
            </Box>
          )}
        </Box>

        <Fab
          color="primary"
          onClick={() => setCreateChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>

        <CreateChatDialog
          open={createChatOpen}
          currentUser={currentUser}
          onClose={() => setCreateChatOpen(false)}
          onCreateChat={handleCreateChat}
          loading={creatingChat}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;