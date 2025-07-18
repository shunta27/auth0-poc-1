# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Auth0 verification and proof-of-concept project built with Next.js. The project is configured for HTTPS development to properly test Auth0 authentication flows.

## Development Commands

- `npm run dev` - Start development server with HTTPS on localhost (uses Turbopack)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript with strict mode enabled
- **Authentication**: Auth0 integration using `@auth0/nextjs-auth0`
- **Styling**: Tailwind CSS v4
- **Development**: HTTPS-enabled with local certificates in `/certificates/`

## Key Configuration

- Development server runs on `https://localhost:3000` (not localhost)
- Local SSL certificates are stored in `/certificates/` directory
- TypeScript path mapping configured with `@/*` pointing to project root
- ESLint configured with Next.js and TypeScript rules

## Auth0 Integration

The project uses Auth0 Next.js SDK v4.6.1 with Management API and email verification:

### Files Structure:

- `lib/auth0.ts` - Auth0Client configuration
- `lib/auth0-management.ts` - Auth0 Management API client setup
- `lib/mailer.ts` - Email sending utilities (Mailtrap integration)
- `middleware.ts` - Auth0 middleware for route protection
- `.env.local` - Auth0 environment variables (not in git)

### Environment Variables (`.env.local`):

```
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_SECRET=your-32-character-secret-here
APP_BASE_URL=https://localhost:3000

# Auth0 Management API Configuration
AUTH0_MANAGEMENT_CLIENT_ID=your-management-api-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=your-management-api-client-secret
AUTH0_MANAGEMENT_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
AUTH0_CONNECTION_NAME=your-connection-name

# Mailtrap Configuration
MAILTRAP_SMTP_USER=your-mailtrap-smtp-user
MAILTRAP_SMTP_PASSWORD=your-mailtrap-smtp-password
MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_FROM_EMAIL=no-reply@demomailtrap.co
```

### Auth0 Dashboard Configuration Required:

- Allowed Callback URLs: `https://localhost:3000/auth/callback`
- Allowed Logout URLs: `https://localhost:3000`

### Application Pages:

#### Authentication Routes (Auth0 SDK automatic):

- `/auth/login` - Login page
- `/auth/logout` - Logout endpoint
- `/auth/callback` - Auth0 callback handler

#### Custom Application Pages:

- `/` - Home page with authentication state handling
- `/create-user` - User registration form page
- `/verify-email` - Email verification confirmation page
- `/profile` - Access token and refresh token management demo page

#### API Endpoints:

- `/api/token` - GET: Retrieve access token and refresh token from session
- `/api/refresh-token` - POST: Refresh access token using refresh token
- `/api/me` - GET: Get user info using Bearer token authentication
- `/api/users` - POST: Create new user with Management API
- `/api/send-email` - POST: Send emails via Mailtrap
- `/api/verify-email` - POST: Handle email verification

### User Registration Flow:

1. User visits `/create-user` page and fills registration form
2. Form submission sends POST to `/api/users`
3. Management API creates user in Auth0
4. Verification email sent automatically via Mailtrap
5. User redirected to `/verify-email` confirmation page
6. User clicks verification link in email to activate account
7. User can then log in through standard Auth0 flow

### Token Management Flow:

1. User completes Auth0 login flow to obtain session with tokens
2. User visits `/profile` page to access token management demo
3. User clicks "トークン取得" to retrieve access token and refresh token from session
4. User clicks "ユーザー情報取得" to call `/api/me` with Bearer token authentication
5. User clicks "トークン更新" to refresh access token using refresh token
6. System automatically fetches user info again with the new access token

### Usage Patterns:

- Use `auth0.getSession()` for server-side authentication
- Use session `tokenSet` to access `accessToken`, `refreshToken`, and `expiresAt`
- Use Bearer token authentication for API endpoints like `/api/me`
- Use Next.js `Link` component for internal navigation (except Auth0 authentication routes like `/auth/login`, `/auth/logout` which should use `<a>` tags)
- Session data includes: `user.name`, `user.email`, `user.sub`
- Token data includes: `accessToken`, `refreshToken`, `expiresAt`, `scope`
- All forms use consistent design system with Tailwind CSS
- Email verification is mandatory for new user accounts
- Refresh tokens enable offline access and token renewal

## Development Rules

**IMPORTANT**: Always use `localhost` with HTTPS for local development, never `localhost`:

- All local URLs must use `https://localhost:3000` format
- Auth0 configuration must point to `localhost` endpoints
- Any localhost references should be changed to `localhost`
- This is required for proper Auth0 authentication flow testing

## Documentation Rules

**README.md Management**:

- Always update README.md when making significant changes to the project
- Use Japanese for README.md content as this is a Japanese PoC project
- Include setup instructions, environment configuration, and project structure
- Document all available npm commands and their purposes
- Provide clear Auth0 dashboard configuration requirements

## Development Notes

- The project uses Turbopack for faster development builds
- Geist fonts are pre-configured (Geist Sans and Geist Mono)
- Strict TypeScript configuration is enabled for better type safety
