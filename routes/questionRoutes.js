const express = require("express");
const { addQuestion,getQuestions, updateLike} = require("../controllers/quesController");

const router = express.Router();

router.post("/question", addQuestion);
router.get("/getQuestion",getQuestions);
router.post("/updatelike", updateLike);


module.exports = router;
