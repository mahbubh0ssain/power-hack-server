require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const port = process.env.PORT || 5000;
app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Power Hack server is running successfully");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@power-hack.svkllsd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("DB connected successfully.");
  } catch (err) {
    console.log(err.message);
  }
};
dbConnect();

const UsersCollection = client.db("Power-Hack").collection("usersCollection");

//user registration
app.post("/registration", async (req, res) => {
  try {
    const token = jwt.sign(req?.body?.email, process.env.ACCESS_TOKEN);

    const isExist = await UsersCollection.findOne({ email: req?.body?.email });

    if (isExist) {
      return res.send({
        message: "You are already registered",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req?.body?.password, salt);

    const user = {
      email: req?.body?.email,
      name: req?.body?.name,
      password: hashedPassword,
    };

    const result = await UsersCollection.insertOne(user);

    res.send({
      success: true,
      result,
      token,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Power Hack server server is running on port ${port}`);
});
