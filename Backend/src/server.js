const express = require('express')
const mongoose=require('mongoose')
const cors= require('cors')
const dotenv=require('dotenv')
dotenv.config()

const app=express()

app.use(cors())
app.use(express.json())


const authRoutes = require('./routes/auth')
app.use('/users',authRoutes)

mongoose.connect(process.env.MONGOURI).then(()=>{
    console.log("MongoDB Connected")
}).catch((err)=>{
    console.error("MongoDB connection Error:",err)
})

app.get('/',(req,res)=>{
    res.send("API running successfully")
})


const PORT= process.env.PORT

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})

