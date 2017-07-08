const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const secret = require('./config/secret');
const Todo = require('./models/todo');

mongoose.connect(secret.database.uri, { useMongoClient: true })
  .catch(err => {
    console.error(err);
  });

// configure app to use bodyParser() accepting JSON only
app.use(bodyParser.json());

let router = express.Router();

router.route('/todos')
  /**
   * create new todo. optionally set it as a child of another one
   */
  .post((req, res) => {
    let todo = new Todo();
    let { value, parent } = req.body;
    todo.value = value;
    // if parent has been provided, check for its existence
    if (parent) {
      Todo.findById(parent, (err, parentTodo) => {
        if (err) {
          res.json(err);
          return;
        }
        // doesn't exist parent todo
        if (!parentTodo) {
          res.json({ error: 'parent todo doesn\'t exist' });
          return;
        }
        todo.parent = parent;
        saveTodo(todo, res);
      });
    } else {
      // save new todo with null parent
      saveTodo(todo, res);
    }
  })

  /**
   * get todos satisfying a provided condition
   */
  .get((req, res) => {
    // the conditions are cast to their respective SchemaTypes before the command is sent.
    let cond = {};
    let { completed, parent } = req.query;
    if (completed) cond.completed = completed;
    // search for root todo without parent
    if (parent === 'null') {
      cond.parent = null;
    } else if (parent) {
      cond.parent = parent;
    }

    Todo.find(cond, (err, todos) => {
      if (err) {
        res.json(err);
        return;
      }
      res.json(todos);
    });
  })

  /**
   * mark todo as completed recusively
   */
  .put((req, res) => {
    let id = req.body.id;
    Todo.findById(id, (err, todo) => {
      if (err) {
        res.json(err);
        return;
      }
      // doesn't exist todo
      if (!todo) {
        res.json({ error: 'todo doesn\'t exist' });
        return;
      }
      checkAllLineageTodos(id);
      todo.completed = true;
      res.json(todo);
    });
    // mark all children todos as completed
    function checkAllLineageTodos(id) {
      Todo.find({ parent: id }, (err, childTodos) => {
        if (err) {
          console.error(err);
        }
        for (let i = 0; i < childTodos.length; i++) {
          checkAllLineageTodos(childTodos[i].id);
        }
        Todo.update({ _id: id }, { completed: true }, (err, todo) => {
          if (err) {
            console.error(err);
          }
        });
      });
    }
  })

  /**
   * delete todo recusively
   */
  .delete((req, res) => {
    // check for existing todo
    let id = req.body.id;
    Todo.findById(id, (err, todo) => {
      if (err) {
        res.json(err);
        return;
      }
      // doesn't exist todo
      if (!todo) {
        res.json({ error: 'todo doesn\'t exist' });
        return;
      }
      deleteAllLineageTodos(id);
      res.json(todo);
    });
    // delete all children todos
    function deleteAllLineageTodos(id) {
      Todo.find({ parent: id }, (err, childTodos) => {
        if (err) {
          console.error(err);
        }
        for (let i = 0; i < childTodos.length; i++) {
          deleteAllLineageTodos(childTodos[i].id);
        }
        Todo.remove({ _id: id }, (err, todo) => {
          if (err) {
            console.error(err);
          }
        });
      });
    }
  });

// save todo to database and handle error
function saveTodo(todo, res) {
  todo.save((err, newTodo) => {
    if (err) {
      res.json(err);
      return;
    }
    // to specify the return HTTP code : res.status();
    res.json(newTodo);
  });
}

// all routes will be prefixed with /api
app.use('/api', router);

let port = process.env.PORT || 8080;
app.listen(port);
console.log('todo-app starts on port ' + port);
