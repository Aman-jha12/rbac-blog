import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type Params = {
  params: {
    userId: string;
  };
};

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: params.userId },
        data: { isDeleted: true },
      }),
      prisma.post.updateMany({
        where: { authorId: params.userId },
        data: { isDeleted: true },
      }),
    ]);

    return NextResponse.json(
      { message: "User and posts deleted" },
      { status: 200 }
    );

  } catch (error) {
    console.error("ADMIN_DELETE_USER:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
