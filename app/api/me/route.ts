import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticationClient } from '@/lib/auth0-management';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' }, 
        { status: 401 }
      );
    }

    const accessToken = authorization.replace('Bearer ', '');
    const authClient = getAuthenticationClient();

    const userInfo = await authClient.users.getInfo(accessToken);

    return NextResponse.json({
      user: {
        sub: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
        updated_at: userInfo.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid access token' }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}