const {
  userRegistration,
  userLogin,
  postBilling,
  getBillings,
  updateBilling,
  deleteBilling,
} = require("../controllers");
const jwt = require("jsonwebtoken");

const router = require("express").Router();
module.exports = router;

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
router.post("/api/registration", userRegistration);

// user login
router.post("/api/login", userLogin);

// post billing
router.post("/api/add-billing", verifyJWT, postBilling);

// get all billings
router.get("/api/billing-list", getBillings);

// update billings by id
router.patch("/api/update-billing/:id", verifyJWT, updateBilling);

//delete bill by id
router.delete("/api/delete-billing/:id", verifyJWT, deleteBilling);
