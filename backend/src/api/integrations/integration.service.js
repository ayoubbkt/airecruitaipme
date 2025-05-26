import prisma from '../../config/db.js';
import pkg from '@prisma/client';
const { CalendarProvider } = pkg;
// For actual calendar API calls, you'd use libraries like:
// import { google } from 'googleapis';
// import { Client } from '@microsoft/microsoft-graph-client';
import { encrypt, decrypt } from '../../utils/encryptionUtils.js'; 
// Placeholder for OAuth configuration
const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI, // e.g., https://api.megahr.com/api/v1/integrations/calendar/google/callback
  scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
};

// const outlookOAuthConfig = { ... };

class IntegrationService {
  // --- Calendar Integrations ---
  async initiateCalendarConnection(userId, provider) {
    if (!Object.values(CalendarProvider).includes(provider)) {
      throw new Error(`Unsupported calendar provider: ${provider}`);
    }
    // This would typically redirect the user to the provider's OAuth consent screen.
    // The actual implementation depends heavily on the OAuth flow.
    // For now, this is a placeholder.
    let authUrl;
    if (provider === CalendarProvider.GOOGLE_WORKSPACE) {
      // const oauth2Client = new google.auth.OAuth2(googleOAuthConfig.clientId, googleOAuthConfig.clientSecret, googleOAuthConfig.redirectUri);
      // authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: googleOAuthConfig.scopes });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleOAuthConfig.clientId}&redirect_uri=${googleOAuthConfig.redirectUri}&response_type=code&scope=${googleOAuthConfig.scopes.join(' ')}&access_type=offline&prompt=consent`;
      console.log("Google Auth URL (for manual testing):", authUrl);
    } else if (provider === CalendarProvider.MS_365_OUTLOOK) {
      // Similar logic for Outlook
      authUrl = "Outlook_OAuth_URL_Placeholder";
    } else {
      throw new Error("Provider not implemented for OAuth initiation.");
    }
    return { authUrl }; // The frontend would redirect the user to this URL.
  }

  async handleGoogleCalendarCallback(userId, code) { // 'code' is the authorization code from Google
    // const oauth2Client = new google.auth.OAuth2(googleOAuthConfig.clientId, googleOAuthConfig.clientSecret, googleOAuthConfig.redirectUri);
    // const { tokens } = await oauth2Client.getToken(code); // Exchange code for tokens
    // oauth2Client.setCredentials(tokens);

    // For this example, we'll mock token retrieval
    const tokens = {
      access_token: `mock_access_token_google_${Date.now()}`,
      refresh_token: `mock_refresh_token_google_${Date.now()}`,
      expiry_date: Date.now() + 3600 * 1000, // 1 hour
      scope: googleOAuthConfig.scopes.join(' '),
    };
    
    // TODO: Get user's primary calendar ID using the access token if needed
    // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // const calendarList = await calendar.calendarList.list();
    // const primaryCalendar = calendarList.data.items.find(cal => cal.primary);
    // const calendarId = primaryCalendar?.id || 'primary';

    await prisma.calendarIntegration.upsert({
  where: { userId_provider: { userId, provider: CalendarProvider.GOOGLE_WORKSPACE } }, // Assurez-vous que ce champ unique existe
  create: {
    userId,
    provider: CalendarProvider.GOOGLE_WORKSPACE,
    accessToken: encrypt(tokens.access_token), // Chiffrer
    refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null, // Chiffrer
    expiresAt: new Date(tokens.expiry_date),
    scopes: tokens.scope,
    // calendarId: calendarId,
  },
  update: {
    accessToken: encrypt(tokens.access_token), // Chiffrer
    // Ne mettez à jour le refreshToken que s'il est explicitement fourni à nouveau
    ...(tokens.refresh_token && { refreshToken: encrypt(tokens.refresh_token) }),
    expiresAt: new Date(tokens.expiry_date),
    scopes: tokens.scope,
    // calendarId: calendarId,
  },
});
    return { message: 'Google Calendar connected successfully.' };
  }
  
  // async handleOutlookCalendarCallback(userId, code) { ... }

  async getMyCalendarIntegrations(userId) {
    return prisma.calendarIntegration.findMany({
      where: { userId },
      select: { provider: true, connectedAt: true, scopes: true /* Do not return tokens */ }
    });
  }

  async disconnectCalendar(userId, provider) {
    if (!Object.values(CalendarProvider).includes(provider)) {
      throw new Error(`Unsupported calendar provider: ${provider}`);
    }
    // TODO: Optionally revoke token with the provider (e.g., oauth2Client.revokeToken(accessToken))
    try {
        await prisma.calendarIntegration.delete({
            // This requires a unique constraint on [userId, provider] in schema
            where: { userId_provider: { userId, provider } }
        });
        return { message: `${provider} Calendar disconnected successfully.` };
    } catch (e) {
        if (e.code === 'P2025') { // Record not found
            const error = new Error(`${provider} Calendar integration not found for this user.`);
            error.statusCode = 404;
            throw error;
        }
        throw e;
    }
  }

  // --- Job Board Integrations (Company Level) ---
  // TODO: Similar CRUD for JobBoardIntegration (connect, disconnect, list)
  // This would involve storing API keys securely and using job board APIs.
}

export default new IntegrationService();