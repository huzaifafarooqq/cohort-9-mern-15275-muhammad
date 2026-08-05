# cohort-9-mern-15275-muhammad
Cohort 9 — MERN (NodeJS+ReactJS) assignment for Muhammad Huzaifa Farooq

# Notes App

A notes application built with the MERN stack that allows authenticated users to securely create, edit, search, pin, and delete personal notes.

## Dashboard

![MERN Notes App Dashboard](docs/dashboard.png)

## Features

### Authentication

- User registration, login, and logout
- JWT-based authentication and authorization
- Password hashing with bcrypt
- Duplicate email validation
- User-specific notes

### Notes Management

- Create, view, edit, and delete notes
- Rich-text editing with TipTap
- Search notes by title or content
- Pin and unpin notes
- Add tags to notes
- Color-coded note cards
- Matching colors for note cards and tags
- Highlighted pinned notes

### User Experience

- Responsive React application
- Notes dashboard
- Create and edit note modals
- Empty states for missing notes and search results
- Toast notifications for successful and failed actions

### Logging and Exception Handling

- Application logging with Pino Logger
- HTTP request and response logging
- User activity and error logging
- Global exception-handling middleware
- Clear validation and server-side error messages

### Testing and Code Quality

- Backend tests with Mocha, Chai, and Supertest
- Frontend tests with Jest and React Testing Library
- SonarQube code-quality and coverage analysis
- Pull-request reviews with CodeRabbit
- Postman testing for authentication and CRUD endpoints
- Automatically generated coverage files excluded from Git

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- TipTap
- Jest
- React Testing Library

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Pino Logger
- Mocha
- Chai
- Supertest

### Tools

- Git and GitHub
- Postman
- SonarQube
- CodeRabbit
- ESLint
- npm

## Project Layout

The repository is divided into two main folders:

- **backend:** Contains the Express server, MongoDB models, controllers, services, routes, authentication middleware, Pino logging, exception handling, and backend tests.
- **frontend:** Contains the React application, authentication pages, notes dashboard, TipTap editor, search functionality, toast notifications, API integration, and frontend tests.

## Getting Started

### Prerequisites

Make sure Node.js version 18 or higher, npm, and Git are installed. A MongoDB Atlas connection is also required.

### Run the Frontend

```bash
cd frontend
npm install
npm run dev

The frontend will run at http://localhost:5173.

## Run the Frontend

```bash
cd backend
npm install
npm start

The backend will run at http://localhost:8000.