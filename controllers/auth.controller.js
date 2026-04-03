const user = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try{
        const {name ,email, password} =req.body;
        const existingUser = await user.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new user({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({message: "User registered successfully"});
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.log(error);
    }
};
exports.loginUser = async(req,res)=>{
    try{
        const { email ,password} = req.body;
        const existingUser = await user.findOne({email});
        if(!existingUser){
            return res.status(400).json({message: "User does not exist"});
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid credentials"});
        }
        const token = jwt.sign({userId: existingUser._id}, process.env.JWT_SECRET);
        res.status(200).json({token});
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.log(error);
    
    }
}