const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    minlength: 1,
    type: String,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not valid email"
    }
  },
  password: {
    required: true,
    type: String,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ["_id", "email"]);
};
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, "letmein123")
    .toString();
  user.tokens.push({ access, token });
  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByeToken = function(token) {
  var User = this;
  var decodedToken;
  try {
    decodedToken = jwt.verify(token, "letmein123");
  } catch (error) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decodedToken._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};
var User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
