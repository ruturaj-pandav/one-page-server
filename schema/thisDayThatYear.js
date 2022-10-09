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
  img: {
    type : String,
    required: true,
  },
  imgkey: {
    type : String,
    required: true,
  },
  dateOfEvent: {
    type: Date,
    required: true,
  }
});

let TDTY = mongoose.model("thisDayThatYear", thisDayThatYearSchema);
module.exports = TDTY;
