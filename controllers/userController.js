const { raw } = require("express");
const Event = require("../models/user");
const XLSX = require('xlsx');

//  Add Event to a Date
exports.addEvent = async (req, res) => {
  try {
    const { date, event } = req.body;
    console.log(req.body, "this is body")
    let existingEvent = await Event.findOne({ date });

    if (existingEvent) {
      console.log("inside")
      if (existingEvent.events.includes(event) == false) {
        console.log("inside 1")

      existingEvent.events.push(event);
      await existingEvent.save();
      res.status(201).json({ message: "Activity added successfully", data: existingEvent });
      
    } 
    else if(existingEvent.events.includes(event) == true){
      res.status(400).json({ message: "Activity data already added",data: event});

    }
    else {
      console.log("inside 2")

      existingEvent = new Event({ date, events: [event] });
      await existingEvent.save();
      res.status(201).json({ message: "Activity added successfully", data: existingEvent });
    }
  }else{
    res.status(400).json({ message: "Activity already added"});
  }

  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};


exports.addExcelData = async (req,res)=>{

  const normalizeDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") {
      console.warn("Invalid date input:", dateString);
      return "";
    }
  
    const currentYear = new Date().getFullYear();
  
    const monthMap = {
      jan: 1, january: 1,
      feb: 2, february: 2,
      mar: 3, march: 3,
      apr: 4, april: 4,
      may: 5,
      jun: 6, june: 6,
      jul: 7, july: 7,
      aug: 8, august: 8,
      sep: 9, september: 9,
      oct: 10, october: 10,
      nov: 11, november: 11,
      dec: 12, december: 12,
    };
  
    // Case 1: dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
    const fullDateMatch = dateString.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (fullDateMatch) {
      const [_, day, month, year] = fullDateMatch;
      return `${+year}-${+month}-${+day}`; // remove leading zeros using unary `+`
    }
  
    // Case 2: dd/mm/yy or dd-mm-yy or dd.mm.yy
    const shortYearMatch = dateString.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
    if (shortYearMatch) {
      const [_, day, month, shortYear] = shortYearMatch;
      const fullYear = +shortYear > 50 ? `19${shortYear}` : `20${shortYear}`;
      return `${+fullYear}-${+month}-${+day}`;
    }
  
    // Case 3: formats like "1-Jun", "01-June", "1 June"
    const dashMatch = dateString.match(/^(\d{1,2})[-\s](\w+)/i);
    if (dashMatch) {
      const day = +dashMatch[1]; // remove leading 0
      const monthName = dashMatch[2].toLowerCase();
      const month = monthMap[monthName];
  
      if (!month || isNaN(day)) {
        console.warn("Invalid month or day in:", dateString);
        return "";
      }
  
      return `${currentYear}-${month}-${day}`;
    }
  
    // Case 4: try built-in Date parser (handles ISO, US formats)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    }
  
    console.warn("Unrecognized date format:", dateString);
    return "";
  };
  
  

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
  
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });
  
    if (jsonData.length === 0 || 
        !jsonData[0].hasOwnProperty("Date") || 
        !jsonData[0].hasOwnProperty("Activity Performed")) {
      return res.status(400).json({ message: "Invalid Format!" });
    }
  
    const cleanedData = jsonData.map(row => ({
      rawDate: row.Date,
      Date: normalizeDate(row.Date),
      Events: row["Activity Performed"]
    }));
  
    for (const row of cleanedData) {
      const { rawDate, Date: normalizedDate, Events } = row;
  
      // Skip blank or invalid date
      if (!rawDate || isNaN(Date.parse(normalizedDate))) {
        console.log(`Skipping invalid or empty date: '${rawDate}'`);
        continue;
      }
  
      if (!Events || Events.trim() === "") {
        console.log(`Skipping ${normalizedDate} as it has no events.`);
        continue;
      }
  
      const data = Events
        .split(/(?:^|\n)\s*\d+\.\s*/) // Handles "1. ", "2. ", etc.
        .map(e => e.trim())
        .filter(Boolean);
  
      console.log("Events:", data);
  
      for (const event of data) {
        let existingEvent = await Event.findOne({ date: normalizedDate });
  
        if (existingEvent) {
          if (!existingEvent.events.includes(event)) {
            existingEvent.events.push(event);
            await existingEvent.save();
          } else {
            console.log(event, "Data already added.");
          }
        } else {
          const newEvent = new Event({ date: normalizedDate, events: [event] });
          await newEvent.save();
        }
      }
    }
  
    res.status(200).json({ message: "Data saved successfully!" });
  } catch (err) {
    console.error("Error while processing Excel file:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
  
}

//  Get Events for a Specific Date
exports.getEventsByDate = async (req, res) => {
  try {
    const { formattedDate } = req.params;
    const events = await Event.findOne({ date: formattedDate });

    if (events) {
        return res.status(200).json(events);
    }
    res.json({ formattedDate, events: [] }); // Empty events array

  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get Events data for all dates
exports.getEvents = async(req,res)=>{
    try{
        const events = await Event.find();
        console.log(events)
        res.status(200).json(events)
    }catch{
        res.status(500).send("Error while getting events data")
    }
}

// Delete an Event from a Date
exports.deleteEvent = async (req, res) => {
    try {
      const { date, index } = req.body;
      console.log("This is the index:", index, "Date:", date);
  
      // Find the event document for the given date
      const eventsData = await Event.findOne({ date });
  
      if (!eventsData) {
        return res.status(404).json({ message: "Date not found" });
      }
  
      // Ensure the index is valid
      if (index < 0 || index >= eventsData.events.length) {
        return res.status(400).json({ message: "Invalid index" });
      }
  
      // Remove the event at the specified index
      eventsData.events.splice(index, 1);
  
      // Save the updated document back to MongoDB
      await eventsData.save();
  
      res.status(200).json({ message: "Event deleted successfully", data: eventsData });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  

exports.get = (req,res)=>{
    res.send("Hello")
}