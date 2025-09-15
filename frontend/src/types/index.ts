export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  name: string;
  participants: string[];
  messages?: Message[];
  participantUsers?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  chatId: string;
  user?: User;
  createdAt: string;
}