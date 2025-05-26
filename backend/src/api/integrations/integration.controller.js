import IntegrationService from './integration.service.js';
import config from '../../config/index.js'; // For redirecting after callback

class IntegrationController {
  // Calendar Integrations
  async initiateCalendarConnection(req, res, next) {
    try {
      const { provider } = req.params; // 'google' or 'outlook'
      const { authUrl } = await IntegrationService.initiateCalendarConnection(req.user.id, provider.toUpperCase().replace('-', '_')); // GOOGLE_WORKSPACE, MS_365_OUTLOOK
      res.status(200).json({ authUrl }); // Frontend redirects user
    } catch (error) {
      next(error);
    }
  }

  async handleGoogleCalendarCallback(req, res, next) {
    try {
      const { code, error: oauthError } = req.query;
      if (oauthError) {
          const error = new Error(`Google OAuth Error: ${oauthError}`);
          error.statusCode = 400;
          throw error;
      }
      if (!code) {
          const error = new Error('Authorization code not provided by Google.');
          error.statusCode = 400;
          throw error;
      }
      // The userId should be available if the callback URL was state-encoded or session based.
      // For simplicity, assuming req.user is populated if user was logged in before initiating.
      // In a real scenario, you'd use the 'state' parameter to link the callback to the user.
      if (!req.user || !req.user.id) {
          const error = new Error('User context not found for Google callback. State parameter might be missing or invalid.');
          error.statusCode = 400;
          throw error;
      }

      await IntegrationService.handleGoogleCalendarCallback(req.user.id, code);
      // Redirect user to a success page in the frontend
      res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?status=google_calendar_connected`);
    } catch (error) {
      // Redirect user to an error page in the frontend
      console.error("Google Callback Error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?status=google_calendar_failed&message=${encodeURIComponent(error.message)}`);
      // next(error); // Or handle error differently
    }
  }
  
  // async handleOutlookCalendarCallback(req, res, next) { ... }

  async getMyCalendarIntegrations(req, res, next) {
    try {
      const integrations = await IntegrationService.getMyCalendarIntegrations(req.user.id);
      res.status(200).json({ data: integrations });
    } catch (error) {
      next(error);
    }
  }

  async disconnectCalendar(req, res, next) {
    try {
      const { provider } = req.params;
      const result = await IntegrationService.disconnectCalendar(req.user.id, provider.toUpperCase().replace('-', '_'));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new IntegrationController();