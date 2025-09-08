// backend/src/utils/calendarService.js
import { google } from 'googleapis';
import config from '../config/index.js';

/**
 * Service de gestion des événements calendrier
 * Support Google Calendar et autres fournisseurs
 */

class CalendarService {
  constructor() {
    this.googleAuth = null;
    this.calendar = null;
    this.initializeGoogleCalendar();
  }

  /**
   * Initialiser Google Calendar API
   */
  initializeGoogleCalendar() {
    try {
      if (!config.google || !config.google.calendar) {
        console.warn('Configuration Google Calendar manquante');
        return;
      }

      // Authentification avec Service Account
      if (config.google.calendar.serviceAccountKey) {
        this.googleAuth = new google.auth.GoogleAuth({
          keyFile: config.google.calendar.serviceAccountKey,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
      } 
      // Authentification OAuth2
      else if (config.google.calendar.clientId && config.google.calendar.clientSecret) {
        this.googleAuth = new google.auth.OAuth2(
          config.google.calendar.clientId,
          config.google.calendar.clientSecret,
          config.google.calendar.redirectUrl
        );

        // Définir les tokens si disponibles
        if (config.google.calendar.refreshToken) {
          this.googleAuth.setCredentials({
            refresh_token: config.google.calendar.refreshToken,
            access_token: config.google.calendar.accessToken
          });
        }
      }

      if (this.googleAuth) {
        this.calendar = google.calendar({ version: 'v3', auth: this.googleAuth });
        console.log('✅ Google Calendar API initialisé');
      }

    } catch (error) {
      console.error('❌ Erreur initialisation Google Calendar:', error.message);
    }
  }

  /**
   * Créer un événement Google Calendar
   */
  async createGoogleCalendarEvent(eventData) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API non initialisé');
      }

      const {
        summary,
        description,
        start,
        end,
        attendees = [],
        location,
        conferenceData,
        calendarId = 'primary'
      } = eventData;

      // Configuration de l'événement
      const event = {
        summary,
        description,
        start: {
          dateTime: start.dateTime,
          timeZone: start.timeZone || 'UTC'
        },
        end: {
          dateTime: end.dateTime,
          timeZone: end.timeZone || 'UTC'
        },
        attendees: attendees.map(email => ({ email })),
        location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24h avant
            { method: 'popup', minutes: 30 }       // 30min avant
          ]
        }
      };

      // Ajouter Google Meet si demandé
      if (conferenceData?.createRequest) {
        event.conferenceData = {
          createRequest: {
            requestId: conferenceData.createRequest.requestId,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
      }

      // Créer l'événement
      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        conferenceDataVersion: conferenceData ? 1 : 0,
        sendUpdates: 'all' // Envoyer invitations à tous les participants
      });

      console.log(`✅ Événement Google Calendar créé: ${response.data.id}`);

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        meetingUrl: response.data.conferenceData?.entryPoints?.[0]?.uri || null
      };

    } catch (error) {
      console.error('❌ Erreur création événement Google Calendar:', error);
      throw new Error(`Échec création événement: ${error.message}`);
    }
  }

  /**
   * Mettre à jour un événement Google Calendar
   */
  async updateGoogleCalendarEvent(eventId, updates, calendarId = 'primary') {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API non initialisé');
      }

      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        resource: updates,
        sendUpdates: 'all'
      });

      console.log(`✅ Événement Google Calendar mis à jour: ${eventId}`);

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour événement:', error);
      throw new Error(`Échec mise à jour: ${error.message}`);
    }
  }

  /**
   * Supprimer un événement Google Calendar
   */
  async deleteGoogleCalendarEvent(eventId, calendarId = 'primary') {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API non initialisé');
      }

      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });

      console.log(`✅ Événement Google Calendar supprimé: ${eventId}`);

      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression événement:', error);
      throw new Error(`Échec suppression: ${error.message}`);
    }
  }

  /**
   * Lister les événements
   */
  async listEvents(calendarId = 'primary', timeMin, timeMax, maxResults = 250) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API non initialisé');
      }

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return {
        success: true,
        events: response.data.items || []
      };

    } catch (error) {
      console.error('❌ Erreur récupération événements:', error);
      throw new Error(`Échec récupération: ${error.message}`);
    }
  }

  /**
   * Vérifier les créneaux libres
   */
  async checkFreeBusy(emails, timeMin, timeMax) {
    try {
      if (!this.calendar) {
        throw new Error('Google Calendar API non initialisé');
      }

      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin,
          timeMax,
          items: emails.map(email => ({ id: email }))
        }
      });

      return {
        success: true,
        calendars: response.data.calendars
      };

    } catch (error) {
      console.error('❌ Erreur vérification disponibilité:', error);
      throw new Error(`Échec vérification: ${error.message}`);
    }
  }

  /**
   * Générer un lien Google Meet
   */
  generateGoogleMeetLink() {
    // Génère un identifiant unique pour la réunion
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${meetingId}`;
  }
}

/**
 * Interface générique pour créer des événements calendrier
 */
export const createCalendarEvent = async (eventData) => {
  const calendarService = new CalendarService();
  
  // Déterminer le fournisseur basé sur la configuration
  const provider = config.calendar?.provider || 'google';
  
  switch (provider) {
    case 'google':
      return calendarService.createGoogleCalendarEvent(eventData);
      
    case 'outlook':
      // Implémentation future pour Outlook/Exchange
      throw new Error('Support Outlook pas encore implémenté');
      
    case 'none':
      // Mode sans calendrier - retourner un événement factice
      return {
        success: true,
        eventId: `local_${Date.now()}`,
        htmlLink: null,
        meetingUrl: eventData.conferenceData ? calendarService.generateGoogleMeetLink() : null
      };
      
    default:
      throw new Error(`Fournisseur calendrier non supporté: ${provider}`);
  }
};

/**
 * Mettre à jour un événement calendrier
 */
export const updateCalendarEvent = async (eventId, updates) => {
  const calendarService = new CalendarService();
  const provider = config.calendar?.provider || 'google';
  
  switch (provider) {
    case 'google':
      return calendarService.updateGoogleCalendarEvent(eventId, updates);
      
    case 'none':
      return { success: true };
      
    default:
      throw new Error(`Fournisseur calendrier non supporté: ${provider}`);
  }
};

/**
 * Supprimer un événement calendrier
 */
export const deleteCalendarEvent = async (eventId) => {
  const calendarService = new CalendarService();
  const provider = config.calendar?.provider || 'google';
  
  switch (provider) {
    case 'google':
      return calendarService.deleteGoogleCalendarEvent(eventId);
      
    case 'none':
      return { success: true };
      
    default:
      throw new Error(`Fournisseur calendrier non supporté: ${provider}`);
  }
};

/**
 * Créer une invitation de réunion complète
 */
export const createMeetingInvitation = async ({
  title,
  description,
  startDateTime,
  endDateTime,
  attendeeEmails = [],
  location,
  includeGoogleMeet = false,
  organizerEmail
}) => {
  try {
    // Préparer les données de l'événement
    const eventData = {
      summary: title,
      description: `${description}\n\nOrganisé par: ${organizerEmail}`,
      start: {
        dateTime: startDateTime,
        timeZone: config.app.timezone || 'UTC'
      },
      end: {
        dateTime: endDateTime,
        timeZone: config.app.timezone || 'UTC'
      },
      attendees: attendeeEmails,
      location
    };

    // Ajouter Google Meet si demandé
    if (includeGoogleMeet) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `meet_${Date.now()}`
        }
      };
    }

    // Créer l'événement calendrier
    const result = await createCalendarEvent(eventData);

    return {
      success: true,
      eventId: result.eventId,
      calendarLink: result.htmlLink,
      meetingUrl: result.meetingUrl,
      eventData
    };

  } catch (error) {
    console.error('❌ Erreur création invitation réunion:', error);
    throw new Error(`Échec création invitation: ${error.message}`);
  }
};

/**
 * Calculer la fin d'un événement basé sur la durée
 */
export const calculateEndTime = (startDateTime, durationMinutes) => {
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toISOString();
};

/**
 * Valider les créneaux horaires
 */
export const validateTimeSlot = (startDateTime, endDateTime) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const now = new Date();

  const validationErrors = [];

  // Vérifier que l'heure de début est dans le futur
  if (start <= now) {
    validationErrors.push('L\'heure de début doit être dans le futur');
  }

  // Vérifier que l\'heure de fin est après l'heure de début
  if (end <= start) {
    validationErrors.push('L\'heure de fin doit être après l\'heure de début');
  }

  // Vérifier que la durée n'est pas trop longue (max 8 heures)
  const durationHours = (end - start) / (1000 * 60 * 60);
  if (durationHours > 8) {
    validationErrors.push('La durée ne peut pas dépasser 8 heures');
  }

  // Vérifier que ce n'est pas trop dans le futur (max 1 an)
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
  if (start > maxFutureDate) {
    validationErrors.push('L\'événement ne peut pas être planifié à plus d\'un an');
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors
  };
};

/**
 * Formater une date pour l'affichage
 */
export const formatDateTime = (dateTimeString, locale = 'fr-FR') => {
  const date = new Date(dateTimeString);
  
  return {
    date: date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }),
    full: date.toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

export default CalendarService;