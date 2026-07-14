const express = require('express');

const router = express.Router();

let tasks = [];
let nextId = 1;

function resetTasks() {
  tasks = [];
  nextId = 1;
}

function findTaskIndex(id) {
  return tasks.findIndex((task) => task.id === id);
}

router.post('/', (req, res) => {
  const { title, description, completed } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const task = {
    id: nextId++,
    title,
    description: typeof description === 'string' ? description : '',
    completed: typeof completed === 'boolean' ? completed : false,
  };

  tasks.push(task);
  return res.status(201).json(task);
});

router.get('/', (req, res) => {
  return res.status(200).json(tasks);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  return res.status(200).json(task);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = findTaskIndex(id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, completed } = req.body || {};

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'description must be a string' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }

  const existing = tasks[index];
  const updated = {
    ...existing,
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(completed !== undefined ? { completed } : {}),
  };

  tasks[index] = updated;
  return res.status(200).json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = findTaskIndex(id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;
module.exports.resetTasks = resetTasks;
