const express = require("express")
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require("multer");
const fs = require("fs");
const path = require("path");


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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/kyc";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${req.user.id}_${Date.now()}${ext}`);
  },
});

// ── File Filter ──
const fileFilter = (req, file, cb) => {
  const allowed = {
    kycImage: ["image/png", "image/jpeg", "image/jpg"],
    kycAudio: ["audio/webm", "audio/mp4", "audio/wav", "audio/mpeg"],
  };
  if (allowed[file.fieldname]?.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}.`), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

router.post("/kyc",authMiddleware,upload.fields([{ name: "kycImage", maxCount: 1 },
    { name: "kycAudio", maxCount: 1 },
]),async(req,res)=>{
  try{

    console.log("FILES:", req.files);   
    console.log("BODY:", req.body);     

    if(!req.files?.kycImage){
      return res.status(400).json({message:"Kyc Image is required"})
    }
    if(!req.files?.kycAudio){
      return res.status(400).json({message:"Kyc Audio is required"})
    }
    const user = await User.findByIdAndUpdate(req.user.id,{
      kycImage:req.files.kycImage[0].path,
      kycAudio:req.files.kycAudio[0].path,
      kycStatus: "submitted",

    },{new:true})
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({
        message: "KYC submitted successfully.",
        
      });

  }catch(error){
    res.status(500).json({ error: error.message });

  }
})
router.get("/kyc-status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "kycStatus kycImage kycAudio"
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports=router