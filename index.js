require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.PORT || 5000;
app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Power Hack server is running successfully");
});

app.listen(port, () => {
  console.log(`Power Hack server server is running on port ${port}`);
});
