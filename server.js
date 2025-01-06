import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from 'path';
import { User } from "./models/user.js";

import { v2 as cloudinary } from 'cloudinary';

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dek7axa0r', 
        api_key: '176767264214584', 
        api_secret: 'BLbnBfVrSbLSJr1GmzGfT3lP2L8' 
    });

const app = express();

app.use(express.urlencoded({extended:true}))

mongoose
  .connect(
    "mongodb+srv://attellitarun:O4G5TYxSm95IcEcL@cluster0.ywwrd.mongodb.net/",
    { dbName: "NodeJs_Authentication" }
  )
  .then(() => console.log("Mongodb Connected", "\n"))
  .catch((error) => console.log("The ERROR is ---->", error));

// show register page
app.get("/register", (req, res) => {
  res.render('register.ejs');
});

// show login page
app.get("/", (req, res) => {
  res.render('login.ejs');
});

//using multer for uploading file and saving in database
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// create user
app.post('/register',upload.single('file'), async(req,res)=>{
  const file=req.file.path;
  console.log('THE FILE IS -->',file);
  
  const {name,email,password}=req.body;

  const cloudinaryResponse= await cloudinary.uploader.upload(file,{
    folder: 'NodeJS_Authentication_Project'
  });

  const user= await User.create({
    profileImg:cloudinaryResponse.secure_url,
    name,email,password
  });

  res.redirect('/');

  console.log('cloudinaryResponse-->',cloudinaryResponse,name,email,password);
});

//user login
app.post('/login',async (req,res)=>{
  const {email,password}=req.body;
   
  let user=await User.findOne({email});

  if(!user){
    res.render('login.ejs',{msg: 'User not found!'})
  }
  else if(user.password != password){
    res.render('login.ejs',{msg: 'Invalid Password!'})
  }
  else{
    res.render('profile.ejs',{user})
  }
});

//All Users
app.get('/users',async (req,res)=>{
  const users=await User.find();
  res.render('users.ejs',{users});
})

app.listen(1000, console.log("Server is running on Port 1000"));
