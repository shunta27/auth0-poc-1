import { NextRequest, NextResponse } from "next/server";
import { getManagementClient } from "../../../lib/auth0-management";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const managementClient = getManagementClient();

    const userData = {
      user_id: email,
      email,
      password,
      connection: process.env.AUTH0_CONNECTION_NAME || "Username-Password-Authentication",
      name: name || email.split("@")[0],
      email_verified: false,
      verify_email: false,
    };

    const user = await managementClient.users.create(userData);

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.data.user_id,
        email: user.data.email,
        name: user.data.name,
        created_at: user.data.created_at,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 409
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
