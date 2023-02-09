const client = require("../DB");

const BillingCollection = client
  .db("Power-Hack")
  .collection("billingCollection");

module.exports = BillingCollection;
