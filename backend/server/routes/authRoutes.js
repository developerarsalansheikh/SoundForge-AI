const express = require("express")
const { registerUser, loginUser, privateControler } = require("../controller/authController")
const protect = require("../middleware/authMiddleware")



const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/private" ,protect, privateControler)



module.exports = router