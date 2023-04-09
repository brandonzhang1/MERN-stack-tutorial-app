const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = 4000;

let Todo = require('./todo.model');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/todos', {useNewUrlParser: true});
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

async function getTodos() {
    const todos = await Todo.find({});
    return todos;
}
todoRoutes.route('/').get(function(req, res) {
    getTodos().then(function(foundTodos, err) {
        res.json(foundTodos);
    }).catch(function (err) {
        res.status(400).send('getting todos failed')
    });
});

async function getTodo(id) {
    const todo = await Todo.findById(id);
    return todo;
}
todoRoutes.route('/:id').get(function(req, res) {
    getTodo(req.params.id).then(function(todo, err) {
        res.json(todo);
    }).catch(function (err) {
        res.status(400).send('getting todo ' + req.params.id.toString() + ' failed')
    });
});
todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

todoRoutes.route('/update/:id').post(function(req, res) {
    getTodo(req.params.id).then(function(todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;
            todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    }).catch(function (err) {
        res.status(400).send("Update not possible");
    });
});

app.use('/todos', todoRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});

