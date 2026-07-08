const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


const registerUser = async (req , res) =>{
   let { name, email, phone, password} = req.body

   if(!name || !email || !phone || !password){
    res.status(400)
    throw new Error("please fill all detail")
   }

   // Check if user already exists
   let userExist = await User.findOne({email : email})
    let phoneExist = await User.findOne({email : email})

   if(userExist || phoneExist){
    res.status(400)
    throw new Error("User Already Exist")
   }

   if(!/^[6-9]\d{9}$/.test(String(phone))){
    res.status(400)
    throw new Error("Please enter a valid 10-digit Indian mobile number")
   }

   //hash password
   const salt = await bcrypt.genSalt(10)
   const hashpassword = await bcrypt.hash(password, salt)

   //create user
   let user = await User.create({
    name,
    email,
    phone,
    password : hashpassword
   })

   if(!user){
    res.status(404)
    throw new Error("user not Created")
   }

   res.status(201).json({
        _id : user._id,
        name : user.name,
        email : user.email,
        phone : user.phone,
        isActive : user.isActive,
        isAdmin : user.isAdmin,
        createdAt : user.createdAt,
        token : generateToken(user._id)
       })

}



const loginUser = async (req , res) =>{
    const {email , password} = req.body

    if(!email || !password){
        res.status(400)
        throw new Error("please fill  details")
    }

    const user = await User.findOne({email})

    if(user && await bcrypt.compare(password, user.password)){
       res.status(200).json({
        _id : user._id,
        name : user.name,
        email : user.email,
        phone : user.phone,
        isActive : user.isActive,
        isAdmin : user.isAdmin,
        createdAt : user.createdAt,
        token : generateToken(user._id)
       })
    } 
    else{
        res.status(401)
        throw new Error("invalid Credentails")
    }
}

const privateControler = async (req , res) =>{
    // console.log(req.user)
    res.json({
        msg : "I am private routes on loggin User can access me"
    })
}






//Generate Token
const generateToken = (_id) =>{
    let token = jwt.sign({_id}, process.env.JWT_SECRET, {expiresIn: "15d"})
    return token
}





module.exports = {registerUser, loginUser, privateControler}