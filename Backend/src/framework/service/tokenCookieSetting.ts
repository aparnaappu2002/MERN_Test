import { Response } from "express";
export const setCookie = (res:Response,refreshToken:string)=>{
    const maxAge = Number(process.env.REFRESHTOKENMAXAGE);

    res.cookie('client_refresh',refreshToken,{
        httpOnly:true,
        secure:false,
        maxAge:maxAge
    })
}