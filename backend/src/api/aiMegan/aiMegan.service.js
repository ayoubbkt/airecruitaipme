import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
 
const { UserRole, CompanyMemberRole, AITone } = pkg;
// Helper
async function checkCompanyAdminAccess(userId, companyId) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || membership.role !== CompanyMemberRole.RECRUITING_ADMIN) {
    const error = new Error('Forbidden: You must be a Recruiting Admin for this company.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

class AiMeganService {
  // --- AI Business Preferences (Company Level) ---
  async getAIBusinessPreferences(userId, companyId) {
    await checkCompanyAdminAccess(userId, companyId);
    return prisma.aIBusinessPreference.upsert({ // Ensure one exists
        where: { companyId },
        create: { companyId },
        update: {}
    });
  }

  async updateAIBusinessPreferences(userId, companyId, preferencesData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { businessOverview, businessCulture, businessValues, businessMission } = preferencesData;
    return prisma.aIBusinessPreference.upsert({
      where: { companyId },
      create: { companyId, businessOverview, businessCulture, businessValues, businessMission },
      update: { businessOverview, businessCulture, businessValues, businessMission },
    });
  }

  // --- AI Communication Preferences (Company Level) ---
  async getAICommunicationPreferences(userId, companyId) {
    await checkCompanyAdminAccess(userId, companyId);
    return prisma.aICommunicationPreference.upsert({ // Ensure one exists
        where: { companyId },
        create: { companyId, tone: AITone.PROFESSIONAL_FORMAL, blockedTeamTopics: [], blockedCandidateTopics: [] },
        update: {}
    });
  }

  async updateAICommunicationPreferences(userId, companyId, preferencesData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { tone, blockedTeamTopics, blockedCandidateTopics } = preferencesData;
    if (tone && !Object.values(AITone).includes(tone)) {
        throw new Error(`Invalid AI tone: ${tone}`);
    }
    return prisma.aICommunicationPreference.upsert({
      where: { companyId },
      create: { 
        companyId, 
        tone: tone || AITone.PROFESSIONAL_FORMAL, 
        blockedTeamTopics: blockedTeamTopics || [], 
        blockedCandidateTopics: blockedCandidateTopics || [] 
      },
      update: { tone, blockedTeamTopics, blockedCandidateTopics },
    });
  }

  // --- AI Feature Configurations (Job/Meeting Level) ---
  async configureAIScreening(userId, jobId, configData) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
    if (!job) throw new Error('Job not found.');
    await checkCompanyAdminAccess(userId, job.companyId);
    const { isEnabled, guidance } = configData;

    return prisma.aIScreeningConfig.upsert({
      where: { jobId },
      create: { jobId, isEnabled: isEnabled || false, guidance },
      update: { isEnabled, guidance },
    });
  }
  
  async getAIScreeningConfig(userId, jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
    if (!job) throw new Error('Job not found.');
    await checkCompanyAdminAccess(userId, job.companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);
    return prisma.aIScreeningConfig.findUnique({ where: { jobId } }) || { jobId, isEnabled: false, guidance: null };
  }

  async configureAIScheduling(userId, jobId, configData) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
    if (!job) throw new Error('Job not found.');
    await checkCompanyAdminAccess(userId, job.companyId);
    const { isEnabled } = configData;

    return prisma.aISchedulingConfig.upsert({
      where: { jobId },
      create: { jobId, isEnabled: isEnabled || false },
      update: { isEnabled },
    });
  }
  
  async getAISchedulingConfig(userId, jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
    if (!job) throw new Error('Job not found.');
    await checkCompanyAdminAccess(userId, job.companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);
    return prisma.aISchedulingConfig.findUnique({ where: { jobId } }) || { jobId, isEnabled: false };
  }


  async configureAINoteTaking(userId, meetingId, configData) {
    const meeting = await prisma.meeting.findUnique({ 
        where: { id: meetingId }, 
        select: { organizerId: true, job: { select: { companyId: true }}, application: { select: { job: { select: {companyId: true}}}}} 
    });
    if (!meeting) throw new Error('Meeting not found.');
    // Permission: Organizer or company admin
    const companyId = meeting.job?.companyId || meeting.application?.job?.companyId;
    if (!companyId) throw new Error('Cannot determine company context for AI note-taking config.');
    if (meeting.organizerId !== userId) {
        await checkCompanyAdminAccess(userId, companyId);
    }
    const { isEnabled } = configData;

    return prisma.aINoteTakingConfig.upsert({
      where: { meetingId },
      create: { meetingId, isEnabled: isEnabled || false },
      update: { isEnabled },
    });
  }
  
  async getAINoteTakingConfig(userId, meetingId) {
    // Similar permission logic as configureAINoteTaking
    const meeting = await prisma.meeting.findUnique({ 
        where: { id: meetingId }, 
        select: { organizerId: true, attendees: { where: { userId }}, job: { select: { companyId: true }}, application: { select: { job: { select: {companyId: true}}}}} 
    });
    if (!meeting) throw new Error('Meeting not found.');
    const companyId = meeting.job?.companyId || meeting.application?.job?.companyId;
    if (!companyId) throw new Error('Cannot determine company context for AI note-taking config.');

    if (meeting.organizerId !== userId && !meeting.attendees.length > 0) { // if not organizer or attendee
        await checkCompanyAdminAccess(userId, companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);
    }
    return prisma.aINoteTakingConfig.findUnique({ where: { meetingId } }) || { meetingId, isEnabled: false };
  }


  // --- AI Interaction Logging ---
  async logAIInteraction(interactionData) {
    const { userId, inputType, input, output } = interactionData;
    // InputType could be an enum if you have predefined types
    return prisma.aIInteractionLog.create({
      data: { userId, inputType, input, output }
    });
  }

  async getAIInteractionLogs(userId, queryParams) {
    // Typically for admins or for a user to see their own interactions
    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;
    
    const whereClause = {};
    // If not MEGA_ADMIN, scope to current user
    const user = await prisma.user.findUnique({where: {id: userId}});
    if(user?.role !== UserRole.MEGA_ADMIN) {
        whereClause.userId = userId;
    }

    const logs = await prisma.aIInteractionLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, email: true } } }
    });
    const totalLogs = await prisma.aIInteractionLog.count({ where: whereClause });
    return {
        data: logs,
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        totalLogs
    };
  }
}

export default new AiMeganService();