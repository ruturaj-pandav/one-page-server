const mongoose = require("mongoose");

const FactSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    unique: true,
  },
  img: {
    type: String,
    required: true,
  },
  imgkey: {
    type: String,
    required: true,
  },

  tags: [
    {
      type: String,
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

let Fact = mongoose.model("fact", FactSchema);
module.exports = Fact;
