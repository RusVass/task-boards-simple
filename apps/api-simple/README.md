# Task Boards API Simple

Simple Express plus TypeScript plus MongoDB backend for Kanban boards.

## Goals
- Minimal, interview friendly code.
- Clear routes and controllers.
- No extra validation libraries.

## Tech
- Node.js, Express
- TypeScript
- MongoDB, Mongoose

## Project structure
src
- server.ts, app start
- app.ts, express app and routes
- db, mongodb connection
- models, mongoose models
- controllers, route handlers
- routes, express routers
- utils, small helpers

## Data model
Board
- _id, name, createdAt, updatedAt

Card
- _id, boardId, column, order, title, description, createdAt, updatedAt

Columns
- todo
- in_progress
- done

Order
- order is a number
- reorder endpoint sets order as array index

## Environment variables
Create `.env` in `apps/api-simple`.

PORT=4000
MONGO_URI=mongodb://localhost:27017/taskboards

## Run locally
cd apps/api-simple
npm install
npm run dev

## API

### Boards
Create board
POST /api/boards
Body
{ "name": "My board" }

Get board with cards
GET /api/boards/:boardId
Response
{ "board": { "publicId": "...", "name": "..." }, "cards": [] }

Update board name
PATCH /api/boards/:boardId
Body
{ "name": "New name" }

Delete board and its cards
DELETE /api/boards/:boardId

### Cards
Create card
POST /api/boards/:boardId/cards
Body
{ "title": "Task", "description": "Text", "column": "todo" }

Update card
PATCH /api/boards/:boardId/cards/:cardId
Body
{ "title": "New", "description": "New text" }

Delete card
DELETE /api/boards/:boardId/cards/:cardId

Reorder cards
PUT /api/boards/:boardId/cards/reorder
Body
{
  "items": [
    { "cardId": "id1", "column": "todo" },
    { "cardId": "id2", "column": "done" }
  ]
}
