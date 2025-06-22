import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token refresh error:", errorData);
      
      return NextResponse.json(
        { 
          error: "Failed to refresh token",
          details: errorData.error_description || errorData.error
        },
        { status: response.status }
      );
    }

    const tokenData = await response.json();

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type || "Bearer",
      scope: tokenData.scope,
    });

  } catch (error) {
    console.error("Error refreshing token:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}