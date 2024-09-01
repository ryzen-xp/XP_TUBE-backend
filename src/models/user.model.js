 import mongoose , {Schema} from "mongoose" 
 import jwt from "jsonwebtoken";
 import bcrypt from "bcrypt"
 const  userSchema  =  new Schema({
    username : {
      type: String ,
      require: true  ,
      unique : true ,
      lowercase : true ,
      trim : true ,
      index : true 

    },

    email: {
      type: String ,
      requre: true ,
      unique : true  ,
      lowercase : true ,
      trim: true 

    } ,
    fullName : {
      type: String ,
      require: true ,
       trim : true  ,
       index : true  
    } ,

    avatar : {
      type : String , // cloudinary url 
      require : true ,

    } ,
    watchHistory : [{
      type : Schema.Types.ObjectId ,
      ref : "Video"
    }] ,

    password : {
      type: String  ,
      require : [true  , 'Password is  required ']

    } ,

    refreshToken : {
      type : String 
    }





 } , { timestamps : true}) ;


 userSchema.pre("save" , async function ( next) {
  if(!this.isModified("password"))  return next();

  this.password = await  bcrypt.hash(this.password , 10);
  next();
 });

 userSchema.methods.isPasswordCorrect = async function(password){
    return   await bcrypt.compare(password , this.password);
 }
  

 userSchema.methods.generateAccessToken = function (){

     return  jwt.sign({
      _id : this._id ,
      email: this.email ,
      username : this.username ,
      fullName : this.fullName
     },  proccess.env.ACCESS_TOKEN_SECRET ,{ expiresIn :proccess.env.ACCESS_TOKEN_EXPIRY }) ;}


 userSchema.methods.refreshAccessToken = function (){

  return  jwt.sign({
   _id : this._id ,
  
  },  proccess.env.REFRESH_TOKEN_SECREAT ,{ expiresIn :proccess.env.REFRESH_TOKEN_EXPIRY }) ;

     


 }

 export const User = mongoose.model("User" , userSchema);