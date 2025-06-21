import { ManagementClient, AuthenticationClient } from "auth0";

let managementClient: ManagementClient | null = null;
let authenticationClient: AuthenticationClient | null = null;

export function getManagementClient(): ManagementClient {
  if (!managementClient) {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
    const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
    const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE;

    if (!domain || !clientId || !clientSecret || !audience) {
      throw new Error("Missing Auth0 Management API configuration");
    }

    managementClient = new ManagementClient({
      domain,
      clientId,
      clientSecret,
      audience,
    });
  }

  return managementClient;
}

export function getAuthenticationClient(): AuthenticationClient {
  if (!authenticationClient) {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      throw new Error("Missing Auth0 configuration");
    }

    authenticationClient = new AuthenticationClient({
      domain,
      clientId,
      clientSecret,
    });
  }

  return authenticationClient;
}
