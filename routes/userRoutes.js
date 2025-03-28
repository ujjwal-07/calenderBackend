const express = require("express");
const { addEvent, getEventsByDate, deleteEvent ,get,getEvents} = require("../controllers/userController");

const router = express.Router();

router.post("/events", addEvent);
router.get("/get", get);
router.get("/getEvents",getEvents)
router.get("/event/:formattedDate", getEventsByDate);
router.post("/deleteEvents", deleteEvent);

module.exports = router;
