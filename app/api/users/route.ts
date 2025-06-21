import { NextRequest, NextResponse } from "next/server";
import { getManagementClient } from "../../../lib/auth0-management";
import { sendEmailVerification } from "../../../lib/mailer";

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
      connection:
        process.env.AUTH0_CONNECTION_NAME || "Username-Password-Authentication",
      name: name || email.split("@")[0],
      email_verified: false,
      verify_email: false,
    };

    const user = await managementClient.users.create(userData);

    // Send email verification after user creation
    const userName = user.data.name || name || email.split("@")[0];
    const emailSent = await sendEmailVerification(email, userName);
    
    if (!emailSent) {
      console.warn('Failed to send verification email to:', email);
      // Delete the created user if email sending failed
      try {
        await managementClient.users.delete({ id: user.data.user_id! });
        console.log('User deleted due to email sending failure:', user.data.user_id);
      } catch (deleteError) {
        console.error('Failed to delete user after email failure:', deleteError);
      }
      return NextResponse.json(
        { error: "Failed to send verification email. User creation cancelled." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.data.user_id,
        email: user.data.email,
        name: user.data.name,
        created_at: user.data.created_at,
        email_verified: user.data.email_verified,
      },
      message: 'User created successfully. Verification email sent.',
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
