import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { 
          error: "missing_authorization_header",
          error_description: "Authorization header with Bearer token is required"
        },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace("Bearer ", "");
    const domain = process.env.AUTH0_DOMAIN;

    const response = await fetch(`https://${domain}/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error("Auth0 userinfo error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: "invalid_token",
            error_description: "The access token is invalid or expired",
            details: errorData.error_description || errorData.error
          },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: "insufficient_scope",
            error_description: "The access token does not have sufficient permissions",
            details: errorData.error_description || errorData.error
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { 
          error: "auth0_error",
          error_description: "Error from Auth0 userinfo endpoint",
          details: errorData.error_description || errorData.error
        },
        { status: response.status }
      );
    }

    const userInfo = await response.json();

    return NextResponse.json({
      user: {
        sub: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
        updated_at: userInfo.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);

    return NextResponse.json(
      { 
        error: "internal_server_error",
        error_description: "An unexpected error occurred while fetching user information"
      },
      { status: 500 }
    );
  }
}
