const jwt = require("jsonwebtoken")
const User = require("../models/userModel")


const protect = async (req, res, next) => {

    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         try {
      token = req.headers.authorization.split(" ")[1]
      let decoded = jwt.verify(token , process.env.JWT_SECRET)
      let user = await User.findById(decoded._id).select("-password")

    if(!user){
         res.status(401)
        throw new Error('Unauthorization access')
    }


      req.user = user
      next() 
    } catch (error) {
         res.status(401)
        throw new Error('Unauthorization access')
    }
}else{
        res.status(401)
        throw new Error('Unauthorization access')
    }
   

}



module.exports = protect