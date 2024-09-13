import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/Cloudianry.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/Apiresponse.js"; 

import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens
const generateAccessRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId); 
    const accessToken = user.generateAccessToken(); 
    const refreshToken = user.refreshAccessToken(); 
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
  }
};

// Register user function
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "Username or email already in use!");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }

  const avatarImage = await uploadonCloudinary(avatarLocalPath);
  const coverImage = await uploadonCloudinary(coverImagePath);

  if (!avatarImage) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatarImage: avatarImage.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully!")
  );
});

// Login user function
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Email or username is required to login!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User not found in database. Please register first.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); 
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password.");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshTokens( user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    );
});

//  Logout user from   website   

const logoutUser   =  asyncHandler( async  ( req , res ) =>{
      await User.findByIdAndUpdate(req.user._id , {
        $unset : {
          refreshToken : 1 ,

        }
      },
    {
      new: true
    }) ;

    const options = {
      httpOnly : true  ,
      secure: true 

    }

  return res
  .status(200)
  .clearCookie("accessToken",  options)
  .clearCookie("refreshToken",  options)
  .json(
    new ApiResponse(
      200,
      {
        
      },
      "User logged Out  successfully"
    )
  );
   

});
// Here is refresh Token  that use to  invoke again user 
const refreshAccessToken  = asyncHandler( async(req, res)=>{
  const incomingRefreshToken =  req.cookie?.refreshToken || req.body?.refreshToken ;
   if(!incomingRefreshToken){
    throw new ApiError(401 , "Not get Refresh Token ")
   };
  try {
     const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECREAT);
     if(!decodedToken){
      throw new ApiError(401 , "Invalid  Refresh Token or  In used Token");
     }
  
     const user = User.findById(decodedToken?._id);
     if(!user){
       throw new ApiError(401 , "Invalid refresh Token")
     }
     if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
     }
  
     const options = {
      httpOnly: true,
      secure: true
  }
  
  const {accessToken, newRefreshToken} = await generateAccessRefreshTokens (user._id)
  
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newRefreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {accessToken, refreshToken: newRefreshToken},
          "Access token refreshed"
      )
  )
  
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
    
  }
});

// Change corrent  password 

const ChangePassword = asyncHandler( async(req, res)=>{
     const {oldpassword  , newpassword} =  req.body ;
     const user = await User.findById(req.user?._id);

     const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);
     if(!isPasswordCorrect){
        throw new ApiError(401 , "Invalid old  Password");
     }
      
     user.password = newpassword ;
     await user.save({validateBeforeSave : false});
      
     return  res.status(200).json( new ApiResponse(200 ,{} , "Password Change successefully !"))


   
} );

//  get corrent user 
const getCurrentUser = asyncHandler(async(req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
})

// change Profile Photo  

const ChangeProfilePhoto  = asyncHandler ( async(req, res)=>{
  const filepath = req.file?.path ;
  if(!filepath){
    throw new ApiError(401 , " Photo path not get");
  }
  const avatar = await uploadonCloudinary(filepath);
  if(!avatar){
    throw new ApiError(401 , "file not upladed on  cloudinary server");
  }
  const user = await User.findByIdAndUpdate(req.user?._id ,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new:true}
  ).select("-password");
  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
  )
  

});

// change user cover image  

const ChangeCoverImage = asyncHandler ( async ( req , res)=>{
   const coverImageFile =  req.file?.url;
   if(!coverImageFile){
    throw new ApiError(401 , " Cover image not  uploded please upload");
   }
   const uploadfile = await uploadonCloudinary(coverImageFile);
   const user  = await User.findByIdAndUpdate(req.user?._id ,{
    $set:{
      coverImage : uploadfile.url
    }
   }, {
    new: true
   }).select("-password");
    return   res.status(200).json(new ApiResponse(200 ,user , "Cover Image uploaded successefully on server"))


})

// Update user profile  data 

const updateUserData = asyncHandler( async( req ,res)=>{
  const { fullName , email}= req.body ;

  if(!fullName || !email){
    throw new ApiError(401 , "Invalid Name or Email Id");
  }
  const user = await User.findByIdAndUpdate(req.user?._id , {
    $set:{
      fullName:fullName ,
      email: email
    }
  }, { new:true}).select("-password");

  return   res.status(200).json(ApiResponse( 200 ,user,  "Update User data successfully !!"));
});


export { registerUser, loginUser , logoutUser ,refreshAccessToken , ChangePassword , getCurrentUser ,ChangeProfilePhoto ,ChangeCoverImage , updateUserData};
