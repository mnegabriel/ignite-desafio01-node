const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const selectedUser = users.find((user) => user.username === username);

  if (!selectedUser) {
    return response.status(404).json({ error: "User not Found" });
  }

  request.user = selectedUser;

  next();
}

function checksExistsUserTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found" });

  request.todo = todo;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const isUsernameInUse = users.some((user) => user.username === username);

  if (isUsernameInUse) {
    return response.status(400).json({ error: "Username already in use." });
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(  
  "/todos/:id",
   checksExistsUserAccount,
   checksExistsUserTodo,
   (request, response) => {

      const { todo } = request;
      const { title, deadline } = request.body;

      if (title) todo.title = title;
      if (deadline) todo.deadline = deadline;

      return response.json(todo);
    }

);

app.patch(  
  "/todos/:id/done",
   checksExistsUserAccount,
   checksExistsUserTodo, 
  (request, response) => {

      const { todo } = request;

      todo.done = !todo.done;

      return response.json(todo);
    }

);

app.delete(  
  "/todos/:id", 
  checksExistsUserAccount, 
  checksExistsUserTodo, 
  (request, response) => {
    
      const { user, todo } = request;

      user.todos.splice(todo, 1);

      return response.status(204).send();
    }

);

module.exports = app;
