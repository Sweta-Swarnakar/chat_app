# Chat App

Simple real-time chat application (client + server) built with React (client-side) and Node/Express (server-side).

## Repository Structure

- `client_side/` — React frontend (start with `npm install` and `npm start`).
- `server-side/` — Node/Express backend (start with `npm install` and `npm start`).

## Quick Start

1. Start the server:

```bash
cd server-side
npm install
npm start
```

2. Start the client:

```bash
cd client_side
npm install
npm start
```

Open the client in your browser (usually `http://localhost:3000`).

## Notes

- Environment variables and DB configuration live in `server-side/src/config/`.
- Socket handling is implemented in `server-side/src/sockets/socketHandler.js`.

## License

MIT
