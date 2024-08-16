const Joi=require('joi');

const signupValidation=(req,res,next)=>{

    const schema=Joi.object({
        username:Joi.string().min(6).required(),
        password:Joi.string().required(),
        confirmPassword:Joi.string().valid(Joi.ref('password')).required()
    });
    const {error}=schema.validate(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message});
    }
    next();
}
const loginValidation=(req,res,next)=>{ 
    const schema=Joi.object({
        username:Joi.string().min(6).required(),
        password:Joi.string().required()
    });
    const {error}=schema.validate(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message});
    }
    next();
}


module.exports={signupValidation,loginValidation}