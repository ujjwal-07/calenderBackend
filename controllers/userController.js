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
      existingEvent.events.push(event);
      await existingEvent.save();
    } else {
      existingEvent = new Event({ date, events: [event] });
      await existingEvent.save();
    }

    res.status(201).json({ message: "Event added successfully", data: existingEvent });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};


exports.addExcelData = async (req,res)=>{

  const normalizeDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      console.warn("Invalid date input:", dateString);
      return "";
    }
  
    const currentYear = new Date().getFullYear();
  
    // Handle cases like "1-Jun" or "1-June"
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
      dec: 12, december: 12
    };
  
    // Try parsing "1-Jun", "01-June", etc.
    const dashMatch = dateString.match(/^(\d{1,2})[-\s](\w+)/i);
    if (dashMatch) {
      const day = parseInt(dashMatch[1], 10);
      const monthName = dashMatch[2].toLowerCase();
      const month = monthMap[monthName];
  
      if (!month || isNaN(day)) {
        console.warn("Invalid month or day in:", dateString);
        return "";
      }
  
      return `${currentYear}-${String(month)}-${String(day)}`;
    }
  
    // Try built-in Date parser fallback (handles "2025-06-01", "6/1/2025", etc.)

    const date = new Date(dateString);
   
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  
    console.warn("Unrecognized date format:", dateString);
    return "";
  };
  

  try{
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
  
    const jsonData = XLSX.utils.sheet_to_json(sheet,{
      raw: false
    });
    console.log(jsonData, jsonData[0].hasOwnProperty("Activity Performed"))
    console.log(jsonData.map(row=>{
      console.log("Date : ", row.Date)

      console.log("Normalised Date : ", normalizeDate(row.Date))
    }))
    if(jsonData[0].hasOwnProperty("Date") && jsonData[0].hasOwnProperty("Activity Performed")){
    const cleanedData = jsonData.map(row => ({
      
      Date: normalizeDate(row.Date), // Force into YYYY-MM-DD
      Events: row["Activity Performed"]
    }));
    console.log("Parsed Excel Data:", cleanedData[0].Date);
    for (const row of cleanedData) {
      const date = row.Date;
    console.log(row, "This is a evet")
      // Skip if there's no event
      if (!row.Events|| row.Events.trim() === "") {
        console.log(`Skipping ${row.Date} as it has no events.`);
        continue;
      }
    
      const data = row.Events
      .split(/(?:^|\n)\s*\d+\.\s*/) // Split only when it starts with a new line or the beginning
      .map(e => e.trim())
        .filter(Boolean); // Remove empty strings
    
      console.log("Events:", data);
    
      for (let i = 0; i < data.length; i++) {
        let existingEvent = await Event.findOne({ date });
    
        if (existingEvent) {
          if (!existingEvent.events.includes(data[i])) {
            existingEvent.events.push(data[i]);
            await existingEvent.save();
          } else {
            console.log(data[i], "Data already added.");
          }
        } else {
          existingEvent = new Event({ date, events: [data[i]] });
          await existingEvent.save();
        }
      }
    }
    res.status(200).json({message: "Data saved successfully!" })

  }else{
// Preferred way
res.status(400).json({ message: "Invalid Format!" });
  }
  }catch(err){
    console.log(err)
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
