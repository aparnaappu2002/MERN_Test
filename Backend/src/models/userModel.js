const mongoose = require('mongoose')

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    kycImage:{
        type:String,
        default:null,
    },
    kycAudio:{
        type:String,
        default:null
    },
    kycStatus: {
      type: String,
      enum: ["pending", "submitted", "verified", "rejected"],
      default: "pending",
    },


})

module.exports = mongoose.model("User",userSchema)