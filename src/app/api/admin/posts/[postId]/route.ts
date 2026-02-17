import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";


type Params = {
  params: {
    postId: string;
  };
};

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const post = await prisma.post.findFirst({
      where: {
        id: params.postId,
        isDeleted: false,
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // 2. Soft delete post
    const post = await prisma.post.update({
      where: { id: params.postId },
      data: { isDeleted: true },
    });

    return NextResponse.json(
      { message: "Post deleted successfully", post },
      { status: 200 }
    );

  } catch (error) {
    console.error("ADMIN_DELETE_POST:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
