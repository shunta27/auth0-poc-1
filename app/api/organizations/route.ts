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

    const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error("Auth0 userinfo error:", {
        status: userInfoResponse.status,
        statusText: userInfoResponse.statusText,
        error: errorData
      });

      if (userInfoResponse.status === 401) {
        return NextResponse.json(
          { 
            error: "invalid_token",
            error_description: "The access token is invalid or expired",
            details: errorData.error_description || errorData.error
          },
          { status: 401 }
        );
      }

      if (userInfoResponse.status === 403) {
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
        { status: userInfoResponse.status }
      );
    }

    const userInfo = await userInfoResponse.json();
    const userId = userInfo.sub;

    if (!userId) {
      return NextResponse.json(
        { 
          error: "invalid_user",
          error_description: "Unable to identify user from token"
        },
        { status: 400 }
      );
    }

    try {
      // First, try to get a Management API token
      const managementTokenResponse = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
          client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
          audience: `https://${domain}/api/v2/`,
          grant_type: 'client_credentials'
        })
      });

      if (!managementTokenResponse.ok) {
        throw new Error('Failed to get Management API token');
      }

      const managementTokenData = await managementTokenResponse.json();
      const managementToken = managementTokenData.access_token;

      // Use Management API token to get user organizations
      const organizationsResponse = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}/organizations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!organizationsResponse.ok) {
        if (organizationsResponse.status === 404) {
          return NextResponse.json({
            organizations: [],
            user_id: userId,
            total: 0,
            message: "No organizations found for this user"
          });
        }

        if (organizationsResponse.status === 403) {
          return NextResponse.json(
            { 
              error: "insufficient_permissions",
              error_description: "Management API does not have sufficient permissions to access user organizations. Please add 'read:organizations' scope to your Management API application in Auth0 Dashboard."
            },
            { status: 403 }
          );
        }

        const errorText = await organizationsResponse.text();
        throw new Error(`Management API error: ${organizationsResponse.status} - ${errorText}`);
      }

      const organizationsData = await organizationsResponse.json();

      return NextResponse.json({
        organizations: organizationsData.map((org: {
          id: string;
          name: string;
          display_name?: string;
          description?: string;
          branding?: object;
          metadata?: object;
        }) => ({
          id: org.id,
          name: org.name,
          display_name: org.display_name,
          description: org.description,
          branding: org.branding,
          metadata: org.metadata,
        })),
        user_id: userId,
        total: organizationsData.length,
      });
    } catch (managementError: unknown) {
      console.error("Auth0 Management API error:", managementError);

      const error = managementError as { message?: string };

      return NextResponse.json(
        { 
          error: "management_api_error",
          error_description: "Error retrieving organizations from Auth0 Management API",
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching user organizations:", error);

    return NextResponse.json(
      { 
        error: "internal_server_error",
        error_description: "An unexpected error occurred while fetching user organizations"
      },
      { status: 500 }
    );
  }
}