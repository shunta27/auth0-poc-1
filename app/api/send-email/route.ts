import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendWelcomeEmail } from '../../../lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html, type, name } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    let success = false;

    if (type === 'welcome') {
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required for welcome email' },
          { status: 400 }
        );
      }
      success = await sendWelcomeEmail(to, name);
    } else {
      if (!subject) {
        return NextResponse.json(
          { error: 'Subject is required for custom email' },
          { status: 400 }
        );
      }
      success = await sendEmail({ to, subject, text, html });
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}