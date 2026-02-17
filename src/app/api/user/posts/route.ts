import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";





export async function GET(){
    try{
        const session=await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({
                message:"Unauthorized",
                status:401
            })
        }
       


        const post=await prisma.post.findMany({
            where:{
                authorId:session.user.id,
                isDeleted:false
             }
            
        })
      if(!post || post.length === 0){
        return NextResponse.json({message:"No posts found"},{status:404})
      }
      return NextResponse.json(post,{status:200})
    }catch(error){
        return NextResponse.json({message:"Internal Server Error", error},{status:500})
    }
}