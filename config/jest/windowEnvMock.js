window._env_ = {
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || "IPR",
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || "GSC",
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || "https://keycloakdev.bcgsc.ca/auth",
  GRAPHKB_URL: process.env.GRAPHKB_URL || "https://graphkbstaging.bcgsc.ca",
  API_BASE_URL: process.env.API_BASE_URL || "https://iprdev-api.bcgsc.ca/api",
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "ipr@bcgsc.ca",
  CONTACT_TICKET_URL: process.env.CONTACT_TICKET_URL || "https://www.bcgsc.ca/jira/projects/IPR",
};
