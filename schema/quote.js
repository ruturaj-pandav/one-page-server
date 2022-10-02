const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  img: {
    type: String,
    required: true,
  },
  imgkey: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

let Quote = mongoose.model("quotes", quoteSchema);
module.exports = Quote;
