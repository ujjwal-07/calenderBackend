const Event = require("../models/user");

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