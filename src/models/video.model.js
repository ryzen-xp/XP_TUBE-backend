import mongoose , { Schema}  from "mongoose";
import { type } from "os";

const  videoSchema = new  Schema ({
    videoFile : {
      type: String ,
      requrie : true  ,

    } ,

    thumbnail : 
    {
       type : String  ,
       require: true 
    } ,
     description: {
       type : String  , require: true 
     },
     



}) ;

export  const Video = mongoose.model("Video" , videoSchema) ;