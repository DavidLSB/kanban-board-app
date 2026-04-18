# Kanban Board App

Kanban-style task management app built with React, TypeScript and Vite, focused on interactive drag-and-drop functionality.

## 🚀 Features

* Full CRUD for columns and tasks
* Drag & drop for tasks:

  * Move between columns
  * Reorder within a column
* Drag & drop for columns (horizontal reordering)
* Visual drag preview (insertion indicator)
* Drag overlay for better UX
* State managed centrally (Board as source of truth)

## 🧠 Technical Highlights

* Uses **dnd-kit** for complex drag and drop interactions
* Optimized drag logic using metadata (`columnId`, `type`) to reduce unnecessary computations
* Array-based state updates for clarity and ease of reasoning
* Separation of concerns between Board, Column and Task components

## 📦 Tech Stack

* React
* TypeScript
* Vite
* dnd-kit

## ▶️ How to run locally

```bash
git clone https://github.com/DavidLSB/kanban-board-app.git
cd kanban-board-app
npm install
npm run dev
```

## 🎥 Demo

[Watch demo](https://youtu.be/niUOtIB3ObY)

## 🛠️ Future Improvements

- Improve code structure and modularization
- Responsive design
- Persistent storage (localStorage or backend)
- Pomodoro / focus mode
- Calendar view
- Deploy