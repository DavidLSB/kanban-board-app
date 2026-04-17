# Kanban Task Manager

Kanban-style task management app built with React, TypeScript and Vite.

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

* Built with **React + TypeScript**
* Uses **dnd-kit** for complex drag and drop interactions
* Optimized drag logic using metadata (`columnId`, `type`) to avoid unnecessary updates
* Array-based state updates for predictable behavior
* Separation of concerns between Board, Column and Task components

## 📦 Tech Stack

* React
* TypeScript
* Vite
* dnd-kit

## ▶️ How to run locally

```bash
git clone https://github.com/DavidLSB/kanban-task-manager.git
cd <project-folder>
npm install
npm run dev
```

## 🎥 Demo

*(Add a short video here showing the main features)*

## 🛠️ Future Improvements

- Improve code structure and modularization
- Responsive design
- Persistent storage (localStorage or backend)
- Pomodoro / focus mode
- Calendar view
- Deploy