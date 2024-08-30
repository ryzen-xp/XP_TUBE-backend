


export {asyncHandler} ;


const asyncHandler = (fn) => async(req , res, next)=> {
  try{
    await fn( req , res , next) ;
  }
  catch(error){
    res.send(error.code || 500).json({succes : false , message : error.message});
  }
}