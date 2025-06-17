import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import * as z from "zod";

import { db } from "@/app/lib/db";

export async function GET() {
  const users = await db.user.findMany({
    orderBy: {
      username: "asc",
    },
  });

  return NextResponse.json({
    users,
  });
}

export async function POST(req: Request) {
  const userSchema = z.object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have than 8 characters"),
  });

  try {
    const body = await req.json();
    const { email, password, username } = userSchema.parse(body);

    const existingUserByEmail = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        {
          user: null,
          message: "This email already exists",
          field: "email",
        },
        {
          status: 409,
        }
      );
    }

    const existingUserByUsername = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        {
          user: null,
          message: "This username already exists",
          field: "username",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
      select: {
        albums: true,
        email: true,
        id: true,
        image: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        user: newUser,
        message: "User created successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error,
        user: null,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
