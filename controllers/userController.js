const User = require("../models/userModel");
const HttpError = require("../models/errorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const fs =require("fs");
const path = require("path");
const{v4: uuid} = require("uuid");




// =================Register a new User
// Post: api/users/register



const registerUser = async(req, res, next)=>{
     try {
        const {name, email, password ,password2}= req.body;
        if(!name || !email || !password){
            return next(new HttpError("Fill the all fields.", 422));
        }
        const newEmail = email.toLowerCase();

        const emailExists = await User.findOne({email: newEmail});
        if(emailExists){
            return next(new HttpError("Email already exists.", 422));
        }

        if((password.trim()).length < 6){
            return next(new HttpError("Password should be at least 6 characters.", 422));
        }

        if(password != password2){
            return next(new HttpError("Password do not match.", 422));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({name, email:newEmail, password:hashedPass});
        res.status(201).json(`New user ${newUser.email} register successfully.`);

     } catch (error) {
        return next (new HttpError("User Registration Failed.", 422));
     }
    
}



// =================Login a registered user
// Post: api/users/login
const loginUser= async(req, res, next)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return next(new HttpError("Fill the all fields.", 422));
        }

        const newEmail = email.toLowerCase();

        const user = await User.findOne({email: newEmail});
        if(!user){
            return next(new HttpError("Invalid user.", 422));
        }

        const comparePass = await bcrypt.compare(password, user.password);
        if(!comparePass){
            return next(new HttpError("invalid credentials.", 422));
        }

        const {_id: id, name} = user;
        const token = jwt.sign({id, name},process.env.JWT_SECRET);
        res.status(200).json({token,name,id});

    } catch (error) {
        return next(new HttpError("Login failed. please check your email.", 422));
    }

    
}



// =================User Profile
// Post: api/users/:id
const getUser = async(req, res, next)=>{
     try {
        const{id} = req.params;
        const user = await User.findById(id).select('-password');
        if(!user){
            return next(new HttpError("User not found.", 404));
        }
        res.status(200).json(user);
     } catch (error) {
        return next(new HttpError(error))
     }
}



// =================Change user avatar(profile picture)
// Post: api/users/change-avatar
const changeAvatar = async(req, res, next)=>{
    try {
        if(!req.files.avatar){
            return next(new HttpError("Please choose an image.", 422));
        }

        //find user from database
        const user = await User.findById(req.user.id);

        //delete old avatar if exists

        if(user.avatar){
            fs.unlink(path.join(__dirname, '..','uploads', user.avatar), (err)=>{
                if(err){
                    return next(new HttpError(err))
                }
            })
        }

        const {avatar} = req.files;

        //check file size
        if(avatar.size > 500000){
            return next(new HttpError("Profile picture too big. should be less than 500kb.",422));
        }

        let fileName;
        fileName = avatar.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length -1];
        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err)=>{
            if(err){
                return next (new HttpError(err));
            }
            const updateAvatar = await User.findByIdAndUpdate(req.user.id,{avatar: newFilename}, {new:true})
            if(!updateAvatar){
                return next(new HttpError("Avatar couldn't be changed.", 422));
            }
            res.status(200).json(updateAvatar);
        })


    } catch (error) {
        return next(new HttpError(error));
    }
}



// =================Edit user deatils (from picture)
// Post: api/users/edit-user
const editUser = async(req, res, next)=>{
   try {
    const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
    if(!name || !email || !currentPassword || !newPassword ){
        return next(new HttpError("Fill the all fields.", 422));
    }

    //get user from database
    const user = await User.findById(req.user.id);
    if(!user){
        return next(new HttpError("User not found.", 403));
    }

    //make sure new email doesn't already exit
      const emailExist = await User.findOne({email});
      
      if(emailExist && (emailExist._id != req.user.id)){
        return next(new HttpError("Email already exist.", 422));
      }

      //compare current password to db password
      const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
      if(!validateUserPassword){
        return next (new HttpError("Invlaid current password.", 422));
      }

      //compare new passwords
      if(newPassword !== confirmNewPassword){
        return next(new HttpError("New passwords do not match.",422));
      }

      //hash new password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      //update user info in database
      const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password:hash}, {new:true});
      res.status(200).json(newInfo);


   } catch (error) {
    return next(new HttpError(error));
   }
}


// =================Get Authors
// Post: api/users/authors
const getAuthors = async(req, res, next)=>{
    try {
        const authors = await User.find().select('-password');
        res.json(authors);
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {registerUser, loginUser, getUser,getAuthors,changeAvatar,editUser}