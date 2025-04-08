const Question = require("../models/question");

//  Add Event to a Date
exports.addQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    console.log(question, "this is body")
    let existingQuestion = await Question.findOne({ question });

    if (existingQuestion) {
      res.status(409).send("Question Already Present")
    } else {
        existingQuestion = new Question({ question : question});
      await existingQuestion.save();
    }

    res.status(201).json({ message: "Question added successfully", data: existingQuestion });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};



exports.updateLike = async (req,res)=>{
   
      const ques = req.body.ques
      console.log(ques)
      try{
        const like_ques = await Question.find({question:ques})
        if(like_ques){
          await Question.updateOne({question:ques},{$inc:{upVote}})
          
        }
        console.log(like_ques)
        res.status(200).json({upvote : like_que});


      }catch(error){
        res.status(500).json({ error: "Server Error" });

      }
    }


//  Get Question 
exports.getQuestions = async (req, res) => {
    console.log("Called")
  try {
    console.log("Called inside")

    const Questions = await Question.find({});

    if (Questions) {
        return res.status(200).json(Questions);
    }
    else{
        res.status(404).send("No Question Added")
    }
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// // Get Events data for all dates
// exports.getEvents = async(req,res)=>{
//     try{
//         const events = await Event.find();
//         console.log(events)
//         res.status(200).json(events)
//     }catch{
//         res.status(500).send("Error while getting events data")
//     }
// }

// // Delete an Event from a Date
// exports.deleteEvent = async (req, res) => {
//     try {
//       const { date, index } = req.body;
//       console.log("This is the index:", index, "Date:", date);
  
//       // Find the event document for the given date
//       const eventsData = await Event.findOne({ date });
  
//       if (!eventsData) {
//         return res.status(404).json({ message: "Date not found" });
//       }
  
//       // Ensure the index is valid
//       if (index < 0 || index >= eventsData.events.length) {
//         return res.status(400).json({ message: "Invalid index" });
//       }
  
//       // Remove the event at the specified index
//       eventsData.events.splice(index, 1);
  
//       // Save the updated document back to MongoDB
//       await eventsData.save();
  
//       res.status(200).json({ message: "Event deleted successfully", data: eventsData });
//     } catch (error) {
//       console.error("Error deleting event:", error);
//       res.status(500).json({ error: "Server Error" });
//     }
//   };
  

// exports.get = (req,res)=>{
//     res.send("Hello")
// }