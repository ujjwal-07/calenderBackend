const mongoose = require("mongoose");
const { type } = require("os");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  upVote : {type: Number},
  downVote : {type : Number},
  answer: { type: [String] }
});

module.exports = mongoose.model("question", questionSchema);
