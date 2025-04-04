const express = require("express");
const multer = require('multer');
const XLSX = require('xlsx');

const { addEvent, getEventsByDate, deleteEvent ,get,getEvents,addExcelData} = require("../controllers/userController");
const { Upload } = require("lucide-react");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage});

router.post("/events", addEvent);
router.get("/get", get);
router.get("/getEvents",getEvents)
router.get("/event/:formattedDate", getEventsByDate);
router.post("/deleteEvents", deleteEvent);
router.post("/store_excel_data",upload.single("excelFile"), addExcelData)
module.exports = router;
