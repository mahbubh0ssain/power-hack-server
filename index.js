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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

// verify JWT
const verifyJWT = (req, res, next) => {
  const headerToken = req.headers.authorization;
  if (!headerToken) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = headerToken.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Access forbidden" });
    }
    req.decoded = decoded;
    next();
  });
};

//user registration
app.post("/api/registration", async (req, res) => {
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
app.post("/api/login", async (req, res) => {
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
app.post("/api/add-billing", verifyJWT, async (req, res) => {
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

// get all billings
app.get("/api/billing-list", async (req, res) => {
  try {
    const search = await req.query.search;
    const page = req.query.page;
    const perPage = parseInt(req.query.perPage);

    let query = {};
    if (search.length > 0) {
      query = {
        $text: {
          $search: search,
        },
      };
    }

    const result = await BillingCollection.find(query)
      .sort({ _id: -1 })
      .skip(page * perPage)
      .limit(perPage)
      .toArray();
    const count = await BillingCollection.estimatedDocumentCount();

    res.send({
      success: true,
      result,
      count,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
});

// update billings by id
app.patch("/api/update-billing/:id", verifyJWT, async (req, res) => {
  try {
    const id = req?.params?.id;
    const bill = await req?.body;
    const result = await BillingCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: bill }
    );
    res.send({
      success: true,
      result,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err?.message,
    });
  }
});

//delete bill by id
app.delete("/api/delete-billing/:id", verifyJWT, async (req, res) => {
  try {
    const id = req?.params?.id;
    const result = await BillingCollection.deleteOne({ _id: ObjectId(id) });
    res.send({
      success: true,
      result,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err?.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Power Hack server server is running on port ${port}`);
});
