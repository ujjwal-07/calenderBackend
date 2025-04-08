const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");

const cors = require("cors")
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", eventRoutes, questionRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
