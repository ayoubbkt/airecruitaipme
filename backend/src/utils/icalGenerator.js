// backend/src/utils/icalGenerator.js
// Utilitaire pour générer des fichiers iCalendar (ICS)

/**
 * Génère un fichier iCalendar (ICS) pour une réunion
 * 
 * @param {Object} meeting - Données de la réunion
 * @returns {String} - Contenu du fichier ICS
 */
export const generateICS = (meeting) => {
  const {
    title,
    description,
    startTime,
    endTime,
    location,
    videoCallLink,
    organizer,
    attendees
  } = meeting;

  // Convertir les dates en format iCalendar (YYYYMMDDTHHmmssZ)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  // Créer un identifiant unique pour l'événement
  const uid = `meeting-${Date.now()}@${organizer.email.split('@')[1]}`;

  // Construire l'événement iCalendar
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RecruitPME//Meeting Scheduler//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST', // Méthode pour invitation
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${title}`,
    `ORGANIZER;CN=${organizer.firstName} ${organizer.lastName}:mailto:${organizer.email}`
  ];

  // Ajouter la description
  if (description) {
    icsContent.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`);
  }

  // Ajouter le lieu
  if (location) {
    icsContent.push(`LOCATION:${location}`);
  }

  // Ajouter le lien visioconférence
  if (videoCallLink) {
    icsContent.push(`URL;VALUE=URI:${videoCallLink}`);
  }

  // Ajouter les participants
  if (attendees && attendees.length > 0) {
    attendees.forEach(attendee => {
      if (attendee.email) {
        const name = attendee.name || attendee.email.split('@')[0];
        icsContent.push(`ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${name}:mailto:${attendee.email}`);
      }
    });
  }

  // Ajouter des rappels
  icsContent.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel de réunion',
    'TRIGGER:-PT30M', // 30 minutes avant
    'END:VALARM'
  );

  // Finaliser l'événement
  icsContent.push(
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
};




export default { generateICS };