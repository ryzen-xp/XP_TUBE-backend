import { v2 as cloudinary } from 'cloudinary' ;
import fs from "fs";

cloudinary.config({
  cloud_name : process.env.CLOUD_NAME ,
  api_key : process.env.API_KEY ,
  api_secret : process.env.API_SECRET
});


const uploadonCloudinary = async(file_path)=>{

  try{
    if(!file_path)  return null ;
    const responce = await cloudinary.uploader.upload(file_path ,{ resource_type : 'auto'});

        fs.unlink(file_path );
        return responce ;

  }
  catch (error){
    fs.unlink(file_path ) ;    // delete the file becuse of file did not uploade on cloudinary 
    return null ;
  }

}

export {uploadonCloudinary} ;