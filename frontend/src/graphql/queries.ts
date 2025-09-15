import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      displayName
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
      username
      email
      displayName
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      username
      email
      displayName
      createdAt
      updatedAt
    }
  }
`;

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      name
      participants
      participantUsers {
        id
        username
        displayName
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CHATS_BY_USER = gql`
  query GetChatsByUser($userId: String!) {
    chatsByUser(userId: $userId) {
      id
      name
      participants
      participantUsers {
        id
        username
        displayName
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CHAT = gql`
  query GetChat($id: ID!) {
    chat(id: $id) {
      id
      name
      participants
      participantUsers {
        id
        username
        displayName
      }
      messages {
        id
        content
        userId
        user {
          id
          username
          displayName
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($createChatInput: CreateChatInput!) {
    createChat(createChatInput: $createChatInput) {
      id
      name
      participants
      participantUsers {
        id
        username
        displayName
      }
      createdAt
      updatedAt
    }
  }
`;

export const JOIN_CHAT = gql`
  mutation JoinChat($chatId: String!, $userId: String!) {
    joinChat(chatId: $chatId, userId: $userId) {
      id
      name
      participants
      participantUsers {
        id
        username
        displayName
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($createMessageInput: CreateMessageInput!) {
    sendMessage(createMessageInput: $createMessageInput) {
      id
      content
      userId
      chatId
      user {
        id
        username
        displayName
      }
      createdAt
    }
  }
`;

export const GET_MESSAGE_HISTORY = gql`
  query GetMessageHistory($chatId: String!, $limit: Int, $offset: Int) {
    messageHistory(chatId: $chatId, limit: $limit, offset: $offset) {
      id
      content
      userId
      user {
        id
        username
        displayName
      }
      createdAt
    }
  }
`;

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($chatId: String!) {
    messageAdded(chatId: $chatId) {
      id
      content
      userId
      chatId
      user {
        id
        username
        displayName
      }
      createdAt
    }
  }
`;