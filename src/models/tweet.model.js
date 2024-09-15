import mongoose , {Schema} from "mongoose";
import { type } from "os";

const tweet =  new Schema({
  content : {
    type: String ,
    required : ture
  },
  owner : {
    type: Schema.Types.ObjectId ,
    ref : "User"
  }
} , {
  timestamps : true
});

export const Tweet = mongoose.model("Tweet" , tweet);
