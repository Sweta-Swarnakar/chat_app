
# Production Style Chat App Backend

## Architecture Notes

- Controllers are intentionally thin and delegate business logic to services.
- Validation is handled before handlers run, and errors flow through a single error middleware.
- Pagination is built into list endpoints so the API is closer to production usage and easier to discuss in interviews.

## Features
- JWT Access + Refresh Tokens
- Socket.IO realtime chat
- Redis caching/pubsub ready
- MongoDB
- MVC + Service Layer
- Rate limiting
- Docker support
- Scalable architecture
- Group chat support
- Typing indicators
- Online/offline tracking
- Clean folder structure

## Tech Stack
- Node.js
- Express
- MongoDB
- Redis
- Socket.IO
- JWT

## Folder Structure
src/
 ├── config/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── services/
 ├── sockets/
 ├── utils/
 └── server.js

## Run
npm install
npm run dev

## Future Scaling
- Kafka
- Microservices
- Kubernetes
- Message queues
- CDN for uploads
- AWS deployment
