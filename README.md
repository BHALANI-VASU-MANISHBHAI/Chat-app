# Chat App

A real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB.

## Features

- Real-time messaging with Socket.io
- User join/leave notifications
- Typing indicators
- Message history storage
- Responsive design
- Clean and modern UI

## Tech Stack

### Backend

- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose
- CORS support
- Environment variables with dotenv

### Frontend

- React 19
- Socket.io Client
- Modern CSS with responsive design
- Vite for development

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Chat-app
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Set up environment variables:
   Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Running the Application

1. Start MongoDB service on your machine

2. Start the backend server:

```bash
cd backend
npm run server
```

3. Start the frontend development server:

```bash
cd frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

- `GET /` - Basic API info
- `GET /api/messages` - Get chat message history

## Socket Events

### Client to Server

- `join` - User joins the chat with username
- `chatMessage` - Send a new message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server to Client

- `message` - New message received
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `typing` - Someone is typing
- `stopTyping` - Typing stopped

## Project Structure

```
Chat-app/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── App.css       # Chat app styles
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # React entry point
│   ├── package.json      # Frontend dependencies
│   └── index.html        # HTML template
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
