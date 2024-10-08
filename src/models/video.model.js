import mongoose , { Schema}  from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const  videoSchema = new  Schema ({
   title : {
    type: String ,
    required : true
   },
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
       type : String  ,
        require: true 
     },

     duration : {
      type :Number ,
      default : 0
     },
      
     isPublished : {
      type : Boolean ,
       default : true 
     },
     owner : {
      type: Schema.Types.ObjectId ,
      ref : "User",
      required : true
     }
}) ;


videoSchema.plugin(mongooseAggregatePaginate);



export  const Video = mongoose.model("Video" , videoSchema) ;