const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Number,
    default: 0,
  },

  img: {
    type: String,
    required: true,
  },
  joined: {
    type: Date,
    default: Date.now,
  },
});

let Users = mongoose.model("users", usersSchema);
module.exports = Users;
