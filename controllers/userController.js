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

  const normalizeDate = (date) => {
    if (!date) return "";
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1);
    const day = String(d.getDate());
    return `${year}-${month}-${day}`;
  };

  try{
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
  
    const jsonData = XLSX.utils.sheet_to_json(sheet,{
      raw: false
    });

    const cleanedData = jsonData.map(row => ({
      Date: normalizeDate(row.Date || row.date), // Force into YYYY-MM-DD
      Events: row.Events || row.event
    }));
    console.log("Parsed Excel Data:", cleanedData);
    for(const row of cleanedData){
      const data = row.Events.split(",");
      const date = row.Date;
      for( var i =0;i< data.length ;i++){
        let existingEvent = await Event.findOne({ date:date });

        if (existingEvent) {
          if(existingEvent.events.includes(data[i] == false)){
          existingEvent.events.push(data[i]);
          await existingEvent.save();
          }else{
            console.log(data[i],"Data already added.")
          }
        } else {
          existingEvent = new Event({ date, events: [data[i]] });
          await existingEvent.save();
        }
      }
    
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
