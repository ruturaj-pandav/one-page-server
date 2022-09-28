const mongoose = require("mongoose");

const thisDayThatYearSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateOfEvent: {
    type: Date,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

let ThisDayThatYear = mongoose.model("thisDayThatYear", thisDayThatYearSchema);
module.exports = ThisDayThatYear;
