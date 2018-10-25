const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");
const { Todo } = require("./../../models/todo");
const { User } = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: "vishalrajole@gmail.com",
    password: "letmein",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userOneId, access: "auth" }, "letmein123")
          .toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "test@gmail.com",
    password: "userTwoPass"
  }
];

const todos = [
  {
    _id: new ObjectID(),
    text: "first todo test"
  },
  {
    _id: new ObjectID(),
    text: "second todo test",
    completed: true,
    completedAt: 342342
  }
];

const populateTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};
const populateUsers = done => {
  User.remove({})
    .then(() => {
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};
module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
};
