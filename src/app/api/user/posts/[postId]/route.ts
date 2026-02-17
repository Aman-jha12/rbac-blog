import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    postId: string;
  };
};

// GET: user fetches their own post
export async function GET(
  req: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findFirst({
      where: {
        id: params.postId,
        authorId: session.user.id,
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
    console.error("USER_GET_POST:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: user soft-deletes their own post
export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findFirst({
      where: {
        id: params.postId,
        authorId: session.user.id,
        isDeleted: false,
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    await prisma.post.update({
      where: { id: params.postId },
      data: { isDeleted: true },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("USER_DELETE_POST:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
