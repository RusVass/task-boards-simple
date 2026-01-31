# Task Boards API

Express and MongoDB backend for task boards and cards.

## Tech
- Node.js
- Express
- TypeScript
- MongoDB, Mongoose

## Data model
Board
- publicId, 24 hex chars
- name
- createdAt
- updatedAt

Card
- boardId, ObjectId in DB
- column, todo or in_progress or done
- order
- title
- description
- createdAt
- updatedAt

Order
- order starts at 0 per column
- reorder endpoint sets order by array index

## Board ID format
- API routes expect publicId in the URL, 24 hex chars
- legacy Mongo ObjectId still works for existing boards, the API assigns a publicId on first access

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
