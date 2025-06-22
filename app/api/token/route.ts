import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokenSet = session.tokenSet;
    
    return NextResponse.json({
      access_token: tokenSet.accessToken,
      refresh_token: tokenSet.refreshToken,
      expires_at: tokenSet.expiresAt,
      expires_in: tokenSet.expiresIn,
      token_type: "Bearer",
      scope: tokenSet.scope,
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
