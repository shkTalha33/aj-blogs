const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config({ path:  './config.env' })

const connectDatabase = async() => {

    await mongoose.connect(process.env.MONGO_URI ,{useNewUrlParser : true})

    console.log("MongoDB Connection Successfully")

}

module.exports = connectDatabase



