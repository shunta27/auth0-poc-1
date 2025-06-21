import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      access_token: session.tokenSet.accessToken,
    });
  } catch (error) {
    console.error("Error fetching access token:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
