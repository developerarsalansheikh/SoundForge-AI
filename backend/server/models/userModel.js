const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
     name :{
        type : String,
        required : [true , " please enter name"]
     },
     email : {
        type : String,
        unique : true,
        required : [true , " please enter email"]
     },
     phone : {
        type : Number,
        unique : true,
        required : [true , " please enter number"]
     },
     password :{
        type : String,
        required : [true , " please enter password"]
     },
     isAdmin : {
         type : Boolean,
        required : true ,
        default : false
     },
     isActive : {
         type : Boolean,
        required : true ,
        default : true
     },
     sunoApiKey : {
         type : String,
         default : null
      }
},{
   timestamps : true
})



module.exports = mongoose.model("User", userSchema)