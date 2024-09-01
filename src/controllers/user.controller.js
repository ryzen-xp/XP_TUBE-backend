
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import  {uploadonCloudinary} from "../utils/Cloudianry.js";
import {User}  from "../models/user.model.js"
import { ApiResponce } from "../utils/Apiresponse.js";





const registerUser =  asyncHandler( async ( req , res)=>{
   res.status(200).json({
    status : "ok"
   })


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
const existedUser = User.findOne( {
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
      avatarImage : avatarImage.url ,
      coverImage : coverImage?.url || ""  ,
      email  ,
      password ,
      username: username.toLowercase()
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




export  {registerUser};


