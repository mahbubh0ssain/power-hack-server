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

// user Collection
const UsersCollection = client.db("Power-Hack").collection("usersCollection");

// generate token for users
const getToken = (email) => {
  const token = jwt.sign(email, process.env.ACCESS_TOKEN);
  return token;
};

//user registration
app.post("/registration", async (req, res) => {
  try {
    // generate token
    const token = getToken(req?.body?.email);

    //check users existence
    const isExist = await UsersCollection.findOne({ email: req?.body?.email });

    if (isExist) {
      return res.send({
        message: "You are already registered",
      });
    }

    // password hashed
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req?.body?.password, salt);

    // user password replaced with hashed password
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

// user login
app.post("/login", async (req, res) => {
  try {
    //check if user is already registered
    const isExist = await UsersCollection.findOne({ email: req.body?.email });
    if (isExist === null) {
      return res.send({
        success: false,
        message: "User does not exist",
      });
    }

    // match user password
    const isMatch = await bcrypt.compare(
      req?.body?.password,
      isExist?.password
    );
    if (!isMatch) {
      return res.send({
        success: false,
        message: "Wrong password",
      });
    }

    // token
    const token = getToken(req?.body?.email);
    res.send({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (err) {
    res.send({
      success: false,
      message: err?.message,
    });
  }
});

// billing Collection
const BillingCollection = client
  .db("Power-Hack")
  .collection("billingCollection");

// post billing
app.post("/add-billing", async (req, res) => {
  try {
    const bill = await req.body;
    const result = await BillingCollection.insertOne(bill);
    res.send({
      success: true,
      result,
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
