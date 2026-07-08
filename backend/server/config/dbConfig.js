const mongoose = require("mongoose")

const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`DB CONNECTION SUCCESS : ${conn.connection.name}`)
    } catch (error) {
        console.log("ERROR IN DB CONNECTION")
    }
}


module.exports = connectDB