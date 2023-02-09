const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const BillingCollection = require("../models/billingsModel");
const UsersCollection = require("../models/userModel");

// generate token for users
const getToken = (email) => {
  const token = jwt.sign(email, process.env.ACCESS_TOKEN);
  return token;
};

exports.userRegistration = async (req, res) => {
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
};

exports.userLogin = async (req, res) => {
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
};

exports.postBilling = async (req, res) => {
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
};

exports.getBillings = async (req, res) => {
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
      // count,
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message,
    });
  }
};

exports.updateBilling = async (req, res) => {
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
};

exports.deleteBilling = async (req, res) => {
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
};
