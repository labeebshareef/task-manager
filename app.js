const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const PRIORITIES = ['low', 'medium', 'high'];

// In-memory store
let tasks = [];
let nextId = 1;

function seed(title, description, completed, priority) {
  tasks.push({
    id: nextId++,
    title,
    description,
    completed,
    priority,
    createdAt: new Date().toISOString(),
  });
}
seed('Set up Express', 'Install Express and create the server', true, 'high');
seed('Create a new project', 'Create a new project using Magic', false, 'medium');

// Validates a task payload. When partial is true (PUT), only provided fields are checked.
function validateTask(body, partial = false) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object'];
  }
  const { title, description, completed, priority } = body;

  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.push('title is required and must be a non-empty string');
    }
  }
  if (!partial || description !== undefined) {
    if (typeof description !== 'string' || description.trim() === '') {
      errors.push('description is required and must be a non-empty string');
    }
  }
  if (!partial || completed !== undefined) {
    if (typeof completed !== 'boolean') {
      errors.push('completed is required and must be a boolean');
    }
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  }
  return errors;
}

function findTask(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Task id must be a positive integer' });
    return null;
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    res.status(404).json({ error: `Task with id ${id} not found` });
    return null;
  }
  return task;
}

// GET /tasks?completed=true|false&sort=asc|desc
app.get('/tasks', (req, res) => {
  let result = [...tasks];
  const { completed, sort } = req.query;

  if (completed !== undefined) {
    if (completed !== 'true' && completed !== 'false') {
      return res.status(400).json({ error: 'completed must be "true" or "false"' });
    }
    result = result.filter((t) => t.completed === (completed === 'true'));
  }

  if (sort !== undefined) {
    if (sort !== 'asc' && sort !== 'desc') {
      return res.status(400).json({ error: 'sort must be "asc" or "desc"' });
    }
    const dir = sort === 'asc' ? 1 : -1;
    result.sort((a, b) => dir * (new Date(a.createdAt) - new Date(b.createdAt) || a.id - b.id));
  }

  res.json(result);
});

app.get('/tasks/priority/:level', (req, res) => {
  const { level } = req.params;
  if (!PRIORITIES.includes(level)) {
    return res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(', ')}` });
  }
  res.json(tasks.filter((t) => t.priority === level));
});

app.get('/tasks/:id', (req, res) => {
  const task = findTask(req, res);
  if (task) res.json(task);
});

app.post('/tasks', (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { title, description, completed, priority = 'medium' } = req.body;
  const task = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    completed,
    priority,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const task = findTask(req, res);
  if (!task) return;

  const errors = validateTask(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  const { title, description, completed, priority } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (completed !== undefined) task.completed = completed;
  if (priority !== undefined) task.priority = priority;
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const task = findTask(req, res);
  if (!task) return;
  tasks = tasks.filter((t) => t.id !== task.id);
  res.json(task);
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Malformed JSON and unexpected errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Task Manager API listening on http://localhost:${port}`);
  });
}

module.exports = app;
