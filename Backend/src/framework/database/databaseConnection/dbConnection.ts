import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();
export class connectMongo{
    private databaseUrl:string
    constructor(){
        if(!process.env.MONGOURI)
        {
            throw new Error('mongodb url is not available')
        }else{
            this.databaseUrl=process.env.MONGOURI
        }
    }
    connectDb()
    {
        mongoose.connect(this.databaseUrl).then(()=>console.log("db connected")).catch((err)=>console.log(err))
    }
}