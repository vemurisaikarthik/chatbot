# Real-Time Chat System

A comprehensive real-time chat application built with TypeScript, NestJS, GraphQL, PostgreSQL, React, and Docker. This system demonstrates microservices architecture with real-time messaging capabilities.

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   User Service  │    │   Chat Service  │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (NestJS)      │
│   Port: 3000    │    │   Port: 4001    │    │   Port: 4002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │   PostgreSQL    │    │   PostgreSQL    │    │     Redis       │
         │   (Users DB)    │    │   (Chats DB)    │    │   (PubSub)      │
         │   Port: 5433    │    │   Port: 5434    │    │   Port: 6379    │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Design Decisions

1. **Microservices Architecture**:
   - **User Service**: Handles user management and authentication
   - **Chat Service**: Manages chats, messages, and real-time communication
   - **Separation of Concerns**: Each service has its own database and responsibilities

2. **Technology Stack**:
   - **Backend**: NestJS with GraphQL for type-safe APIs
   - **Frontend**: React with Material-UI for responsive design
   - **Databases**: PostgreSQL for persistent data storage
   - **Real-time**: GraphQL subscriptions with Redis pub/sub
   - **Containerization**: Docker for consistent deployment

3. **Scalability Features**:
   - Multiple service instances supported
   - Redis for distributed pub/sub messaging
   - Database indexing for message ordering
   - Horizontal scaling capabilities

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 24+ (for local development)
- Git

### Running the System

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd chat-system
   ```

2. **Start all services with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - 2 User Service instances (ports 4001, 4003)
   - 2 Chat Service instances (ports 4002, 4004)
   - 1 Frontend instance (port 3000)
   - 2 PostgreSQL databases (ports 5433, 5434)
   - 1 Redis instance (port 6379)

3. **Access the application**:
   - Frontend: http://localhost:3000
   - User Service GraphQL Playground: http://localhost:4001/graphql
   - Chat Service GraphQL Playground: http://localhost:4002/graphql

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   npm run install:all
   ```

2. **Start services in development mode**:
   ```bash
   # Start databases first
   docker-compose up -d user-db chat-db redis

   # Then start services
   npm run dev
   ```

## 🧪 Testing

### Running Tests

1. **Unit Tests**:
   ```bash
   npm run test
   ```

2. **End-to-End Tests**:
   ```bash
   # Start test database
   docker-compose up -d user-db chat-db redis

   # Run E2E tests
   npm run test:e2e
   ```

### Test Coverage

The E2E tests cover the complete flow:
- Creating users and chats
- Sending and receiving messages
- Real-time message delivery
- Message ordering verification
- Multi-user chat functionality

## 📡 API Documentation

### User Service (GraphQL)

**Queries:**
- `users`: Get all users
- `user(id: ID!)`: Get user by ID
- `userByUsername(username: String!)`: Get user by username

**Mutations:**
- `createUser(createUserInput: CreateUserInput!)`: Create new user

### Chat Service (GraphQL)

**Queries:**
- `chats`: Get all chats
- `chat(id: ID!)`: Get chat by ID
- `chatsByUser(userId: String!)`: Get chats for a user
- `messageHistory(chatId: String!, limit: Int, offset: Int)`: Get message history

**Mutations:**
- `createChat(createChatInput: CreateChatInput!)`: Create new chat
- `joinChat(chatId: String!, userId: String!)`: Join a chat
- `sendMessage(createMessageInput: CreateMessageInput!)`: Send a message

**Subscriptions:**
- `messageAdded(chatId: String!)`: Subscribe to new messages in a chat

## 🔧 Configuration

### Environment Variables

**User Service:**
- `PORT`: Service port (default: 4001)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

**Chat Service:**
- `PORT`: Service port (default: 4002)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `REDIS_URL`: Redis connection URL
- `USER_SERVICE_URL`: User service GraphQL endpoint

## 🏥 Health Checks

All services include health check endpoints:
- Services respond to GraphQL introspection queries
- Docker health checks verify service availability
- Automatic service restart on failure

## 🔄 Real-Time Features

### Message Ordering
- Messages are indexed by chat ID and creation time
- Database queries ensure chronological order
- Real-time updates preserve message sequence

### Scalability
- Multiple service instances share Redis pub/sub
- Database connections are pooled for efficiency
- Stateless services enable horizontal scaling

## 🛠️ Development Notes

### Architectural Decisions

1. **GraphQL over REST**: Provides type safety and flexible querying
2. **Microservices**: Enables independent scaling and deployment
3. **Redis for PubSub**: Ensures real-time messaging across instances
4. **TypeORM**: Provides database abstraction and migrations
5. **Material-UI**: Consistent and responsive frontend design

## 🚦 Limitations and Trade-offs

### Current Limitations
1. **Authentication**: Basic username-based auth (production would need OAuth/JWT)
2. **Message History**: No pagination optimization for very large chats
3. **File Uploads**: No support for media messages
4. **Push Notifications**: No mobile/desktop notifications

### Trade-offs Made
1. **Consistency vs Availability**: Chose eventual consistency for better performance
2. **Simplicity vs Features**: Focused on core chat functionality
3. **Development Speed vs Optimization**: Prioritized working system over micro-optimizations

## 🔮 Future Enhancements

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - OAuth integration

2. **Advanced Features**
   - Message reactions and threading
   - File and media sharing
   - Voice/video calling integration
   - Message encryption

3. **Scalability Improvements**
   - Message sharding strategies
   - CDN for media content
   - Connection pooling optimizations
   - Kubernetes deployment configs

4. **Monitoring & Observability**
   - Prometheus metrics
   - Distributed tracing
   - Centralized logging
   - Performance monitoring

## 📋 System Requirements

- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4 CPU cores
- **Storage**: 2GB for containers and data
- **Network**: Ports 3000, 4001-4004, 5433-5434, 6379

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using TypeScript, NestJS, GraphQL, React, and Docker**