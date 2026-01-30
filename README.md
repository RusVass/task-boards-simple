# Task Management Boards

Test project for managing boards and cards without authentication.

## Tech stack

Frontend
React, TypeScript, hooks only.
State manager for data, useContext plus useReducer.
Axios.
SCSS Modules.
HTML5 drag and drop.

Backend
Express.js, TypeScript.
MongoDB, Mongoose.

Quality
ESLint, Prettier.

## Project structure

apps
api-simple, Express API
web-simple, React web app

docker
docker-compose.yml

## Requirements covered

- Create, update, and delete boards.
- Each board has 3 columns, ToDo, In Progress, Done.
- Load a board by ID.
- Add, edit, and delete cards.
- Drag and drop across columns and reordering within a column.
- Anonymous access, no login.

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

Order
Order starts at 0 in each column.
Client sends items, backend normalizes the order.

## Environment

API, `apps/api-simple/.env`
PORT=4000
CORS_ORIGIN=http://localhost:5173
MONGO_URI=your_mongo_uri

Web, `apps/web-simple/.env`
VITE_API_URL=http://localhost:4000/api

## Local run

Install deps from the repo root.
npm install

Start API.
cd apps/api-simple
npm run dev

Start web.
cd apps/web-simple
npm run dev

Open
http://localhost:5173

## Docker

Run Mongo plus api plus web.
cd docker
docker compose up --build
