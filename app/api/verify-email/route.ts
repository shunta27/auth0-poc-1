import { NextRequest, NextResponse } from "next/server";
import { verifyEmailVerificationToken } from "../../../lib/jwt";
import { getManagementClient } from "../../../lib/auth0-management";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify JWT token
    const payload = verifyEmailVerificationToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    const { email } = payload;

    // Update user's email verification status in Auth0
    const managementClient = getManagementClient();

    try {
      // Find user by email
      const users = await managementClient.usersByEmail.getByEmail({ email });

      if (!users.data || users.data.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = users.data[0];

      // Update user's email verification status
      await managementClient.users.update(
        { id: user.user_id! },
        { email_verified: true }
      );

      // Redirect to login page with email prefilled
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("login_hint", email);
      return NextResponse.redirect(loginUrl);
    } catch (auth0Error) {
      console.error("Auth0 Management API error:", auth0Error);
      return NextResponse.json(
        { error: "Failed to verify email address" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
