const express = require("express")
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const authMiddleware = require("../middleware/authMiddleware");

const router= express.Router()


//Register
router.post('/register',async(req,res)=>{
    try{
        const {email,password}=req.body
        if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter." });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one number." });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one special character (!@#$%^&*)." });
    }

        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }
        
        const hashedPassword=await bcrypt.hash(password, 10)
        const user=new User({
            email,
            password:hashedPassword,
        })
        await user.save()
        res.status(201).json({message:"User registered successfully"})
    }
    catch(error){
        res.status(500).json({error:error.message})

    }
})
//Login
router.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body
        if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }


    const user= await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"Invalid Credentials"})
    }

    console.log("User from DB:", user);
    console.log("Entered password:", password);
    console.log("Stored password:", user?.password);
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).json({message:"Invalid Credentials"})
    }
    const token = jwt.sign({id:user._id},process.env.JWTSECRET,{expiresIn:"1d"})
    res.json({token})
    }catch(error){
        res.status(500).json({error:error.message})
    }
})

router.get("/dashboard", authMiddleware, async(req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit=5
  const search=req.query.search || ""

  const users = await User.find({
    email:{$regex:search,$options:"i"}
  })
  .skip((page-1) * limit).limit(limit)

  console.log("Users",users)

  const total = await User.countDocuments()
  res.json({users,total})
});

module.exports=router