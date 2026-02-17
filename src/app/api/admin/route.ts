import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

// Validate query param
const userIdSchema = z.string().uuid();

export async function GET(req: Request) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Authorization (RBAC)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // 3. Read query param
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");

    if (!userIdParam) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // 4. Validate userId
    const parsed = userIdSchema.safeParse(userIdParam);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid userId" },
        { status: 400 }
      );
    }

    // 5. Fetch user
    const user = await prisma.user.findUnique({
      where: {
        id: parsed.data,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        posts: {
          where: { isDeleted: false },
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // 6. Success
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("ADMIN_GET_USER_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
