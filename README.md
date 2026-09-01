# Kanban Board App

A full-stack Kanban task management application built with React, TypeScript, Vite, Node.js and Express.

The project started as a frontend-focused Kanban board with drag & drop, and evolved into a full-stack application with a REST API, server-side board ownership, optimistic client updates, local persistence, conflict detection and automated tests.

## 🚀 Features


### Task & Board Management
* Full CRUD for columns and tasks
* Drag & drop for tasks, powered by dnd-kit:

  * Move between columns
  * Reorder within a column
* Drag & drop for columns, powered by dnd-kit (horizontal reordering)
* Visual drag preview (insertion indicator)
* Drag overlay for better UX
* Responsive layout for desktop and mobile

### Persistence & Synchronization
* Server-side board persistence through a REST API
* Local persistence using browser localStorage
* Local/server data comparison
* Conflict resolution between local and server data
* Automatic loading of server data when no local board exists
* Optimistic UI updates
* Rollback when server mutations fail
* TanStack Query cache used as the frontend source of truth

### Users & Access Control
* Automatic user creation for first-time visitors
* Boards associated with users
* Server-side verification that a user has access to a requested board
* REST routes scoped through user and board identifiers

## 🧠 Technical Highlights

### Full-stack architecture
The frontend communicates with a separate Node.js + Express backend through a REST API.

The application is structured around:

React frontend -> TanStack Query -> REST API -> Express backend -> In-memory server data

The backend manages temporal users and their associated boards in memory, while the frontend maintains a local copy of the active board using browser localStorage.

The current backend uses in-memory storage intentionally. PostgreSQL can be introduced later without changing the fundamental frontend/backend separation.

### Client-side state and optimistic updates
TanStack Query manages the client-side server state.

Mutations update the Query cache immediately instead of waiting for the server response, allowing the UI to react instantly. A previous snapshot is kept so failed mutations can restore the previous state.

The server remains authoritative: successful responses can reconcile the client state, while failed mutations trigger a rollback.

### Local persistence and conflict handling
The application maintains a local copy of the current board using localStorage.

When server data is loaded, the application compares the relevant board data against the locally stored version. If both versions exist and differ, the user can choose which version to continue with.

Local storage also contains a version number so incompatible client-side data can be discarded when the application's storage format changes.

### Server-side validation
Backend operations validate the relevant user, board and resource before modifying data.

Board access is checked through the user's associated board IDs, preventing a user from accessing a board that does not belong to them.

The backend also uses explicit HTTP error codes such as:

* 400 — invalid request
* 401 — user does not exist
* 403 — user does not have permission
* 404 — requested resource does not exist

Mutation operations are designed to validate their required resources before modifying server state.

### Drag & Drop

The board uses dnd-kit for complex task and column drag & drop.

Tasks can be:

Reordered inside the same column
Moved between columns
Dropped above or below another task
Moved into an empty column

Columns can also be reordered horizontally.

The drag logic calculates the resulting board structure and sends the appropriate update to the backend.

### Testing
The project includes automated tests for backend controllers and board manipulation utilities. The backend tests use Vitest as the test runner and Supertest to exercise the Express API through HTTP requests.

The test suite covers CRUD operations, resource lookup, error handling, authorization and task/column manipulation.

## 📦 Tech Stack

### Frontend
* React
* TypeScript
* TanStack Query
* Vite
* dnd-kit
* HTML/CSS
* Browser localStorage
### Backend
* Node.js
* Express
* TypeScript
* REST API
### Testing & Development
* Git
* Unit testing
* Vitest (Frontend and backend)
* Supertest (The backend test suite uses Vitest as the test runner and Supertest to exercise the Express API through HTTP requests.)
* Separate frontend/backend development environments
### Deployment
* Frontend deployed on Vercel
* Backend deployed on Render
The frontend communicates with the deployed backend through a configurable VITE_API_URL environment variable.
## ▶️ How to run locally
Clone the repository:

* git clone https://github.com/DavidLSB/kanban-board-app.git
* cd kanban-board-app

The frontend uses the VITE_API_URL environment variable to determine which backend API it should communicate with.

For local development:

VITE_API_URL=http://localhost:3001

The backend has strict CORS policy, go to server/src/app.ts, and change 
*     origin: 'https://kanban-board-app-13z4.vercel.app'
to 
*     origin: 'http://localhost:5173'

Install dependencies for the frontend and backend.

Start the backend and frontend in their respective directories (/server and /client) separately:

* npm install
* npm run dev
## 🌐 Live Demo

[Open Live Demo](https://kanban-board-app-13z4.vercel.app/)

The live application uses the deployed Express backend and supports the current user/board flow.
## 🎥 Video Demo

[Watch demo](https://youtu.be/niUOtIB3ObY)

This video demonstrates the application's drag & drop functionality. It was recorded before the backend was introduced, so it showcases the interaction system rather than the current full-stack architecture.
## 📚 What This Project Demonstrates

This project was built as an opportunity to explore the progression from a client-side application into a full-stack system.

The main areas explored were:

* React component architecture
* TypeScript
* Complex drag & drop interactions
* REST API design
* Express backend architecture
* Client/server state synchronization
* Optimistic UI updates and rollback
* Local persistence
* Conflict detection and resolution
* User/board relationships
* HTTP error handling
* Automated testing
* Frontend/backend deployment
## 🛠️ Future Improvements

- PostgreSQL Database persistence
- Authentication and proper user accounts
- Multiple boards per user
- More robust data migration/versioning
- Real-time collaboration
- Further component and hook modularization
- Pomodoro / focus mode
- Calendar view