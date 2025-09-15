import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Chat System (e2e)', () => {
  let app: INestApplication;
  let userService: any;
  let createdUserId: string;
  let createdChatId: string;
  let createdMessageId: string;

  const mockUserServiceResponse = {
    data: {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock the user service HTTP calls
    const httpService = moduleFixture.get('HttpService');
    jest.spyOn(httpService, 'post').mockImplementation(() => ({
      subscribe: (observer: any) => {
        observer.next({ data: mockUserServiceResponse });
        observer.complete();
      },
      pipe: jest.fn().mockReturnThis(),
    }));

    createdUserId = mockUserServiceResponse.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a chat', async () => {
    const createChatInput = {
      name: 'Test Chat',
      participants: [createdUserId, '123e4567-e89b-12d3-a456-426614174001'],
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation CreateChat($createChatInput: CreateChatInput!) {
            createChat(createChatInput: $createChatInput) {
              id
              name
              participants
              createdAt
              updatedAt
            }
          }
        `,
        variables: { createChatInput },
      })
      .expect(200);

    expect(response.body.data.createChat).toBeDefined();
    expect(response.body.data.createChat.name).toBe(createChatInput.name);
    expect(response.body.data.createChat.participants).toEqual(createChatInput.participants);

    createdChatId = response.body.data.createChat.id;
  });

  it('should send a message to the chat', async () => {
    const createMessageInput = {
      content: 'Hello, this is a test message!',
      chatId: createdChatId,
      userId: createdUserId,
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation SendMessage($createMessageInput: CreateMessageInput!) {
            sendMessage(createMessageInput: $createMessageInput) {
              id
              content
              userId
              chatId
              createdAt
            }
          }
        `,
        variables: { createMessageInput },
      })
      .expect(200);

    expect(response.body.data.sendMessage).toBeDefined();
    expect(response.body.data.sendMessage.content).toBe(createMessageInput.content);
    expect(response.body.data.sendMessage.userId).toBe(createMessageInput.userId);
    expect(response.body.data.sendMessage.chatId).toBe(createMessageInput.chatId);

    createdMessageId = response.body.data.sendMessage.id;
  });

  it('should retrieve message history', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query GetMessageHistory($chatId: String!) {
            messageHistory(chatId: $chatId) {
              id
              content
              userId
              createdAt
            }
          }
        `,
        variables: { chatId: createdChatId },
      })
      .expect(200);

    expect(response.body.data.messageHistory).toBeDefined();
    expect(response.body.data.messageHistory).toHaveLength(1);
    expect(response.body.data.messageHistory[0].id).toBe(createdMessageId);
    expect(response.body.data.messageHistory[0].content).toBe('Hello, this is a test message!');
  });

  it('should retrieve chat with messages', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query GetChat($id: ID!) {
            chat(id: $id) {
              id
              name
              participants
              messages {
                id
                content
                userId
                createdAt
              }
            }
          }
        `,
        variables: { id: createdChatId },
      })
      .expect(200);

    expect(response.body.data.chat).toBeDefined();
    expect(response.body.data.chat.id).toBe(createdChatId);
    expect(response.body.data.chat.messages).toHaveLength(1);
    expect(response.body.data.chat.messages[0].content).toBe('Hello, this is a test message!');
  });

  it('should join a user to an existing chat', async () => {
    const newUserId = '123e4567-e89b-12d3-a456-426614174002';

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation JoinChat($chatId: String!, $userId: String!) {
            joinChat(chatId: $chatId, userId: $userId) {
              id
              participants
            }
          }
        `,
        variables: {
          chatId: createdChatId,
          userId: newUserId
        },
      })
      .expect(200);

    expect(response.body.data.joinChat).toBeDefined();
    expect(response.body.data.joinChat.participants).toContain(newUserId);
    expect(response.body.data.joinChat.participants).toHaveLength(3);
  });

  it('should send and receive messages in correct order', async () => {
    const messages = [
      'First message',
      'Second message',
      'Third message'
    ];

    // Send multiple messages
    for (const content of messages) {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation SendMessage($createMessageInput: CreateMessageInput!) {
              sendMessage(createMessageInput: $createMessageInput) {
                id
                content
              }
            }
          `,
          variables: {
            createMessageInput: {
              content,
              chatId: createdChatId,
              userId: createdUserId,
            },
          },
        })
        .expect(200);
    }

    // Retrieve message history and verify order
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query GetMessageHistory($chatId: String!) {
            messageHistory(chatId: $chatId) {
              id
              content
              createdAt
            }
          }
        `,
        variables: { chatId: createdChatId },
      })
      .expect(200);

    const retrievedMessages = response.body.data.messageHistory;
    expect(retrievedMessages).toHaveLength(4); // Original message + 3 new messages

    // Verify messages are in chronological order
    for (let i = 1; i < retrievedMessages.length; i++) {
      const prevTime = new Date(retrievedMessages[i - 1].createdAt);
      const currentTime = new Date(retrievedMessages[i].createdAt);
      expect(currentTime.getTime()).toBeGreaterThanOrEqual(prevTime.getTime());
    }

    // Verify content of the last 3 messages
    const lastThreeMessages = retrievedMessages.slice(-3);
    messages.forEach((expectedContent, index) => {
      expect(lastThreeMessages[index].content).toBe(expectedContent);
    });
  });
});