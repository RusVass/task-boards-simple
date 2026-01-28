# Task Boards, Kanban

Kanban board without authentication.
Board has publicId and name.
Columns are fixed, todo, in_progress, done.
Card has title, description, column, order.
Drag and drop updates column and order, and syncs with the backend.

## Tech stack

Frontend
React, TypeScript, hooks only.
useContext plus useReducer as state manager.
@dnd-kit for drag and drop.
React Hook Form, Zod.
Axios.
SCSS Modules.

Backend
Node.js, Express, TypeScript.
MongoDB, Mongoose.
Zod validation.
cors, helmet, compression.

Quality
ESLint, Prettier.
Dockerfile for web and api.
GitHub Actions for lint and test.

## Monorepo structure

apps
api, Express API
web, React web app

docker
docker-compose.yml

.github
workflows, CI

## Architecture

### Frontend

Data flow
UI dispatches action.
Reducer updates state.
API layer calls backend.
UI renders from state.

Core modules
src state BoardContext.tsx
src api boardsApi.ts
src pages BoardPage.tsx
src components Column, Card, CreateCardForm

### Backend

Routing
Routes map to controllers.
Controllers validate input.
Services run business logic.
Models handle DB.

Core modules
src modules boards
src modules cards
src config db connection
src middlewares error handler

## Data model

Board
publicId string
name string
createdAt date
updatedAt date

Card
boardId string
column todo or in_progress or done
order number
title string
description string optional
createdAt date
updatedAt date

Order rules
Order starts from 0 per column.
Client sends reorder items.
Backend normalizes order to 0..n per column.

## Environment

API, apps api .env

PORT=4000
CORS_ORIGIN=http://localhost:5173
MONGO_URI=your_mongo_uri

Web, apps web .env

VITE_API_URL=http://localhost:4000/api

## Local run

Install deps from root.

npm install

Start API.

cd apps/api
npm run dev

Start web.

cd apps/web
npm run dev

Open.

http://localhost:5173

## API

Base url
http://localhost:4000/api

Boards

Create board
POST /boards
body
{
  "name": "Board A"
}
response
{
  "publicId": "NZSACDLKHg",
  "name": "Board A"
}

Get board with cards
GET /boards/:publicId
response
{
  "board": { "publicId": "NZSACDLKHg", "name": "Board A" },
  "cards": []
}

Update board name
PATCH /boards/:publicId
body
{
  "name": "New name"
}

Delete board with cascade delete cards
DELETE /boards/:publicId

Cards

Create card
POST /boards/:publicId/cards
body
{
  "title": "First task",
  "description": "Details",
  "column": "todo"
}

Update card
PATCH /boards/:publicId/cards/:cardId
body
{
  "title": "Updated",
  "description": "Updated text"
}

Delete card
DELETE /boards/:publicId/cards/:cardId

Reorder cards
PUT /boards/:publicId/cards/reorder
body
{
  "items": [
    { "cardId": "64f...", "column": "done" },
    { "cardId": "64a...", "column": "done" }
  ]
}

## Docker

Run Mongo plus api plus web.

cd docker
docker compose up --build
