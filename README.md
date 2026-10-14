# Task Manager API

A simple RESTful API for managing tasks, built with Node.js and Express. Tasks are stored in memory, so data resets every time the server restarts.

## Features

- CRUD operations for tasks
- Input validation with `400` responses and `404` for missing tasks
- Filter tasks by completion status
- Sort tasks by creation date
- Task priority (`low`, `medium`, `high`) with a priority lookup endpoint

## Setup

Requirements: Node.js 18+.

```bash
npm install
```

```bash
npm start
```

The server runs on `http://localhost:3000` (override with the `PORT` environment variable).

## Task schema

```json
{
  "id": 2,
  "title": "Create a new project",
  "description": "Create a new project using Magic",
  "completed": false,
  "priority": "medium",
  "createdAt": "2026-10-14T08:00:00.000Z"
}
```

`id` and `createdAt` are set by the server. `priority` is optional on create and defaults to `medium`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/tasks` | Get all tasks. Optional query: `completed=true\|false`, `sort=asc\|desc` (by creation date) |
| GET | `/tasks/:id` | Get a task by ID |
| GET | `/tasks/priority/:level` | Get tasks by priority (`low`, `medium`, `high`) |
| POST | `/tasks` | Create a task (`title`, `description`, `completed` required; `priority` optional) |
| PUT | `/tasks/:id` | Update a task (any subset of `title`, `description`, `completed`, `priority`) |
| DELETE | `/tasks/:id` | Delete a task; returns the deleted task |

### Validation rules

- `title` and `description` must be non-empty strings.
- `completed` must be a boolean.
- `priority` must be `low`, `medium` or `high`.

### Status codes

| Code | When |
| --- | --- |
| 200 | Successful read, update or delete |
| 201 | Task created |
| 400 | Invalid input, invalid ID, invalid query parameter or malformed JSON |
| 404 | Task or route not found |

Error responses look like `{ "error": "..." }`, or `{ "errors": ["..."] }` for validation failures.

## Testing with curl

Get all tasks:

```bash
curl http://localhost:3000/tasks
```

Filter and sort:

```bash
curl "http://localhost:3000/tasks?completed=false&sort=desc"
```

Get one task:

```bash
curl http://localhost:3000/tasks/1
```

Get tasks by priority:

```bash
curl http://localhost:3000/tasks/priority/high
```

Create a task:

```bash
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Write docs","description":"Document the API","completed":false,"priority":"low"}'
```

Update a task:

```bash
curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d '{"completed":true,"priority":"high"}'
```

Delete a task:

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

Invalid input (returns 400):

```bash
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"","description":"x","completed":"yes"}'
```

Missing task (returns 404):

```bash
curl http://localhost:3000/tasks/999
```

You can run the same requests from Postman by setting the method, URL and a raw JSON body.
