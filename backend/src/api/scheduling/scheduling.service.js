import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole, MeetingType, AttendeeStatus } = pkg;
// Helper to check if user can manage meetings for a job/application
async function checkMeetingPermission(userId, companyId, allowedRoles = [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER]) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || !allowedRoles.includes(membership.role)) {
    const error = new Error('Forbidden: You do not have permission to manage meetings for this entity.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

class SchedulingService {
  // --- Meeting Templates (Company Level) ---
  async createMeetingTemplate(userId, companyId, templateData) {
    await checkMeetingPermission(userId, companyId); // Requires admin/manager
    const { name, title, duration, meetingType, description /*, defaultRatingCardId */ } = templateData;

    if (!name || !title || !duration || !meetingType) {
      throw new Error('Name, title, duration, and meetingType are required for template.');
    }
    if (!Object.values(MeetingType).includes(meetingType)) {
        throw new Error(`Invalid meeting type: ${meetingType}`);
    }

    return prisma.meetingTemplate.create({
      data: {
        companyId,
        name,
        title,
        duration, // in minutes
        meetingType,
        description,
        // defaultRatingCardId
      }
    });
  }

  async getMeetingTemplatesByCompany(userId, companyId) {
    await checkMeetingPermission(userId, companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]); // Reviewers can see templates
    return prisma.meetingTemplate.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });
  }
  
  // TODO: GetById, Update, Delete for Meeting Templates

  // --- Meetings ---
  async scheduleMeeting(organizerId, meetingData) {
    const { 
        title, description, startTime, endTime, type, location, videoCallLink, 
        jobId, applicationId, attendees, meetingTemplateId 
    } = meetingData;
    // attendees: [{ email, name?, userId?, isCandidate? }]

    if (!title || !startTime || !endTime || !type) {
      throw new Error('Title, startTime, endTime, and type are required for a meeting.');
    }
    if (new Date(startTime) >= new Date(endTime)) {
        throw new Error('Start time must be before end time.');
    }
    if (!Object.values(MeetingType).includes(type)) {
        throw new Error(`Invalid meeting type: ${type}`);
    }

    let companyIdForPermissionCheck;
    if (applicationId) {
        const app = await prisma.application.findUnique({ where: { id: applicationId }, select: { job: { select: { companyId: true }}}});
        if (!app) throw new Error('Application not found.');
        companyIdForPermissionCheck = app.job.companyId;
    } else if (jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true }});
        if (!job) throw new Error('Job not found.');
        companyIdForPermissionCheck = job.companyId;
    } else {
        // If no job/app, maybe it's a general company meeting? Requires different permission logic or scope.
        // For now, assume meetings are job/app related.
        throw new Error('Meeting must be associated with a job or application.');
    }
    await checkMeetingPermission(organizerId, companyIdForPermissionCheck);

    // TODO: Validate attendees array (emails, userIds if provided)
    // TODO: If meetingTemplateId, fetch template and use its defaults for title, duration, type, description if not provided

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        location,
        videoCallLink,
        jobId,
        applicationId,
        organizerId,
        meetingTemplateId,
        attendees: attendees && attendees.length > 0 ? {
          create: attendees.map(att => ({
            email: att.email,
            name: att.name,
            userId: att.userId, // If attendee is a platform user
            isCandidate: att.isCandidate || false,
            status: att.userId === organizerId ? AttendeeStatus.ACCEPTED : AttendeeStatus.PENDING
          }))
        } : undefined
      },
      include: {
        organizer: { select: { id: true, email: true, firstName: true, lastName: true } },
        attendees: { include: { user: { select: { id: true, email: true } } } },
        // job: { select: { id: true, title: true }},
        // application: { select: { id: true, candidate: { select: { firstName: true, lastName: true }}}}
      }
    });

    // TODO: Send calendar invites / notifications to attendees
    // This would involve calendar integration (Google Calendar, Outlook Calendar)

    return meeting;
  }

  async getMeetingById(userId, meetingId) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        organizer: { select: { id: true, email: true } },
        attendees: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        job: { select: { id: true, title: true, companyId: true } },
        application: { select: { id: true, candidate: { select: { id:true, email: true, firstName: true, lastName: true } } } }
      }
    });

    if (!meeting) {
      const error = new Error('Meeting not found.');
      error.statusCode = 404;
      throw error;
    }

    // Permission check: User is organizer, an attendee, or admin of the related company
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

  const isOrganizer = meeting.organizerId === userId;
  const isAttendee = meeting.attendees.some(
    att => att.userId === userId || (user && att.email === user.email)
  );

    let companyIdForPermissionCheck = meeting.job?.companyId;
    // If no job, try to get companyId from application's job (if meeting linked to application)
    // This part needs to be robust if meetings can exist without direct job link.
    
    if (!isOrganizer && !isAttendee) {
        if (!companyIdForPermissionCheck && meeting.applicationId) {
            const app = await prisma.application.findUnique({ where: { id: meeting.applicationId }, select: { job: { select: { companyId: true }}}});
            companyIdForPermissionCheck = app?.job?.companyId;
        }
        if (!companyIdForPermissionCheck) {
             const error = new Error('Forbidden: Cannot determine company context for meeting permission.');
             error.statusCode = 403;
             throw error;
        }
        await checkMeetingPermission(userId, companyIdForPermissionCheck, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);
    }
    return meeting;
  }

  async getMyMeetings(userId, queryParams) {
    const { upcoming = true, page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({where: {id: userId}, select: {email: true}});
    if(!user) throw new Error('User not found.');

    const whereClause = {
        OR: [
            { organizerId: userId },
            { attendees: { some: { OR: [{ userId: userId }, {email: user.email}] } } }
        ]
    };
    if (upcoming === 'true' || upcoming === true) { // Check for string 'true' from query params
        whereClause.startTime = { gte: new Date() };
    } else if (upcoming === 'false' || upcoming === false) {
        whereClause.startTime = { lt: new Date() };
    }


    const meetings = await prisma.meeting.findMany({
        where: whereClause,
        orderBy: { startTime: upcoming === 'true' || upcoming === true ? 'asc' : 'desc' },
        skip,
        take: limit,
        include: {
            organizer: { select: { id: true, firstName: true, lastName: true } },
            attendees: { select: { email: true, status: true, user: {select: {firstName: true, lastName: true}} } },
            job: { select: { title: true } },
            application: { select: { candidate : { select: {firstName: true, lastName: true}}}},
        }
    });
    const totalMeetings = await prisma.meeting.count({ where: whereClause });
    return {
        data: meetings,
        currentPage: page,
        totalPages: Math.ceil(totalMeetings / limit),
        totalMeetings
    };
  }
  
  // TODO: UpdateMeeting, CancelMeeting (soft delete or status change)
  // TODO: Update attendee status (Accept/Decline invite)
}

export default new SchedulingService();