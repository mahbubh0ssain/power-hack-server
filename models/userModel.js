const client = require("../DB");

const UsersCollection = client.db("Power-Hack").collection("usersCollection");

module.exports = UsersCollection;
