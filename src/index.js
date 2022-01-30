const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "User not found!" })
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (users.filter(user => user.username === username).length > 0){
    return response.status(400).json({ error: "User already exists!" })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  const updatedTodo = {
    ...todo,
    title: title, 
    deadline: deadline
  }

  user.todos.splice(todo, 1, updatedTodo)

  return response.status(201).json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  const updatedTodo = { ...todo, done: !todo.done }

  user.todos.splice(todo, 1, updatedTodo)

  return response.status(201).json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;