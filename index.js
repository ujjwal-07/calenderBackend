const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/userRoutes");
const cors = require("cors")
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("Hello this is added for learning purpose please ignore")
app.use("/api", eventRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
