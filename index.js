require("dotenv").config();
const express = require("express");
const router = require("./routes");
const cors = require("cors");
const port = process.env.PORT || 5000;
app = express();
app.use(express.json());
app.use(cors());
app.use(router);

app.get("/", (req, res) => {
  res.send("Power Hack server is running successfully");
});

app.listen(port, () => {
  console.log(`Power Hack server server is running on port ${port}`);
});
