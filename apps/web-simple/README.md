# Task Boards Web

React web app for task boards and cards.

## Tech
- React
- TypeScript
- React Router
- Context plus useReducer for state
- Axios
- SCSS Modules
- HTML5 drag and drop

## Features
- Create, rename, and delete boards
- Load a board by ID
- Add, edit, delete, and reorder cards
- Drag and drop across columns

## Board ID format
- UI expects a 24 hex char board ID

## Environment variables
Create `.env` in `apps/web-simple`.

VITE_API_URL=http://localhost:4000/api

## Run locally
cd apps/web-simple
npm install
npm run dev

## Tests
npm test
