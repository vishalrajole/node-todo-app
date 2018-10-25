const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");
const { app } = require("./../server");
const { Todo } = require("./../models/todo");

const { todos, populateTodos, users, populateUsers } = require("./seed/seed");

beforeEach(populateTodos);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "Test todo post test";
    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((error, res) => {
        if (error) {
          return done(error);
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(3);
            expect(todos[2].text).toBe(text);
            done();
          })
          .catch(error => done(error));
      });
  });

  it("should not create Todo for invalid data", done => {
    var text = "";
    request(app)
      .post("/todos")
      .send({ text })
      .expect(400)
      .end((error, res) => {
        if (error) {
          return done(error);
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(error => done(error));
      });
  });
});
describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});
describe("GET /todos/:id", () => {
  var id = "";
  it("should return todo document", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
  it("should return 404 if todo not found", done => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });
  it("should return 404 for non-object ids", done => {
    request(app)
      .get("/todos/abcd")
      .expect(404)
      .end(done);
  });
});
describe("DELETE /todos/:id", () => {
  it("should remove document", done => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(error => {
            done(error);
          });
      });
  });
  it("should return 404 if todo not found", done => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });
  it("should return 404 for non-object ids", done => {
    request(app)
      .delete("/todos/abcd")
      .expect(404)
      .end(done);
  });
});
describe("PATCH /todos/:id", () => {
  it("should update the todo", done => {
    var hexId = todos[0]._id.toHexString();
    var text = "updated text";

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
      })
      .end(done);
  });
  it("should clear completedAt when todo is not completed", done => {
    var hexId = todos[1]._id.toHexString();
    var text = "updated text for second";

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBeA(users[0]._id.toHexString());
        expect(res.body.email).toBeA(users[0].email);
      })
      .end(done);
  });
  it("should return 401 user if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});
