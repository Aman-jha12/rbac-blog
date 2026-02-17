import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";



export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {    try{
     const session=await getServerSession(authOptions);
     if(!session){
        return NextResponse.json({message:"Unauthorized"},{status:401})
     }




      const post=await prisma.post.findFirst({
        where:{
            id:params.postId,
            authorId:session.user.id,
            isDeleted:false
         }
        })
       
        
        if(params.postId!==post?.id){
            return NextResponse.json({message:"Forbidden"},{status:403})
        }

        if(!post){
            return NextResponse.json({message:"Post not found"},{status:404})
        }
        return NextResponse.json(post,{status:200})



    }catch(error){
        return NextResponse.json({message:"Internal Server Error",error},{status:500})
    }}