const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Store date as YYYY-MM-DD
  events: { type: [String], default: [] } // List of events for this date
});

module.exports = mongoose.model("Event", EventSchema);
