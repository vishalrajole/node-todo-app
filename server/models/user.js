var mongoose = require("mongoose");

var User = mongoose.model("User", {
  email: {
    required: true,
    minlength: 1,
    type: String,
    trim: true
  }
});

module.export = {
  User
};
