
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import  {uploadonCloudinary} from "../utils/Cloudianry.js";
import {User}  from "../models/user.model.js"
import { ApiResponce } from "../utils/Apiresponse.js";

import jwt from "jsonwebtoken";



const  genrateAccessRefreshTokens = async (userId)=>{
  try {
  const user = await User.findOne(userId);
  const accessToken =  user.genrateAccessToken();
  const refreshToken = user.genraterefreshToken();
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return {accessToken, refreshToken}
  }
  catch(error){
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }

}





const registerUser =  asyncHandler( async ( req , res)=>{
   

//  get user detailed from frontend 
//  cvalidation  - not empty 
//  check id user alraady exist  :  by checking  user name and  email

//   check for images and avatars
//  upload that on cloudinary , avatar

//  create user object  -  create entry in DB
//  remove password and  token field form response
//  check for user creation 
//  return res 
const {fullName , email , username , password}  = req.body ;

console.log("email" , email);

if( [fullName, email , username , password].some((field) => {
  field?.trim()=== "";
})){

  throw new ApiError( 400 , "All field are  requires");
}
const existedUser = await  User.findOne( {
  $or : [{username} , {email}]
});

if(existedUser){
   throw new ApiError(409 , "username or  email already in used !!!");
}

const avatarLocalpath =  req.files?.avatar[0]?.path ;
 const coverImagepath =   req.files?.coverImage[0]?.path ;

 if(!avatarLocalpath){
  throw new ApiError(400 , " Avatar file  required");
 }
 
     const avatarImage = await uploadonCloudinary(avatarLocalpath);
     const coverImage = await uploadonCloudinary(coverImagepath);
     if(!avatarImage){
      throw new ApiError(400 , "Avatar required file ");
     }

     const  user =  await User.create ({
      fullName ,
      avatarImage : avatarImage?.url ,
      coverImage : coverImage?.url || ""  ,
      email  ,
      password ,
      username: username.toLowerCase()
     })

     const createsUser = await  User.findById(user._id).select(
      "-password -refreshToken"
     )

     if(!createsUser){
      throw new ApiError(500 , "Somthing  went wrong  while registering ")
     }
  
       return  res.status(201).json(
        new ApiResponce(201 , createsUser , "User registered  successfully !!")
       )
});


// Login  handling  here  code start form  this line 

const loginUser =   asyncHandler ( async (req ,res )=> {
   const {username , email , password } =  req.body ;
     if(!username || !email){
        throw new  ApiError(400 , " email and username is  require to login !!");
     }

     const  user = await   User.findOne( {
      $or : [{username} , {email}]
     });
     if(!user){
      throw new ApiError(404 , "User not Found in  Database , Register your self first")
     }

     const isPasswordvalid = await User.isPasswordCorrect(password);
     if(!isPasswordvalid){
       throw new ApiError(401 , " Invalid Password ");
     }

       const {accessToken , refreshToken} = await  genrateAccessRefreshTokens(user._id);
      




})




export  {registerUser};


