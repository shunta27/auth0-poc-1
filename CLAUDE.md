# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Auth0 verification and proof-of-concept project built with Next.js. The project is configured for HTTPS development to properly test Auth0 authentication flows.

## Development Commands

- `npm run dev` - Start development server with HTTPS on 127.0.0.1 (uses Turbopack)
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

- Development server runs on `https://127.0.0.1:3000` (not localhost)
- Local SSL certificates are stored in `/certificates/` directory
- TypeScript path mapping configured with `@/*` pointing to project root
- ESLint configured with Next.js and TypeScript rules

## Auth0 Integration

The project includes Auth0 SDK for Next.js authentication. When working with Auth0 features:
- HTTPS is required for proper Auth0 callback handling
- Environment variables for Auth0 configuration should be set up
- Use the Auth0 Next.js SDK patterns for authentication flows

## Development Rules

**IMPORTANT**: Always use `127.0.0.1` with HTTPS for local development, never `localhost`:
- All local URLs must use `https://127.0.0.1:3000` format
- Auth0 configuration must point to `127.0.0.1` endpoints
- Any localhost references should be changed to `127.0.0.1`
- This is required for proper Auth0 authentication flow testing

## Development Notes

- The project uses Turbopack for faster development builds
- Geist fonts are pre-configured (Geist Sans and Geist Mono)
- Strict TypeScript configuration is enabled for better type safety