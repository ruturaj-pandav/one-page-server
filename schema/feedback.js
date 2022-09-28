const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
   
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

let Feedback = mongoose.model("feedback", feedbackSchema);
module.exports = Feedback;
