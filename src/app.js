const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();

app.use(express.json());
app.use('/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
