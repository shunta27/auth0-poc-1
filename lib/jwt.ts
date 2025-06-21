import jwt from 'jsonwebtoken';

export interface EmailVerificationPayload {
  email: string;
  exp?: number;
}

export function generateEmailVerificationToken(email: string, expiresIn: string = '24h'): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload: EmailVerificationPayload = {
    email,
  };

  return jwt.sign(payload, jwtSecret, { 
    expiresIn,
    issuer: 'auth-poc',
    subject: 'email-verification'
  } as jwt.SignOptions);
}

export function verifyEmailVerificationToken(token: string): EmailVerificationPayload | null {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'auth-poc',
      subject: 'email-verification'
    }) as EmailVerificationPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function generateGenericToken(payload: Record<string, unknown>, expiresIn: string = '1h'): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, jwtSecret, { 
    expiresIn,
    issuer: 'auth-poc'
  } as jwt.SignOptions);
}

export function verifyGenericToken(token: string): Record<string, unknown> | null {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'auth-poc'
    });
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}