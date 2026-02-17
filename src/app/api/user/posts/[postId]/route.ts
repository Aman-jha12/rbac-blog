import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";









export async function POST(req:Request, {params}:{params:{postId:string}}){
    try{
     const session=await getServerSession(authOptions);
     if(!session){
        return NextResponse.json({message:"Unauthorized"},{status:401})
     }


     



    }catch(error){
        return NextResponse.json({message:"Internal Server Error",error},{status:500})
    }}