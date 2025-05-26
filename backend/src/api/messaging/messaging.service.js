import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole, CommentVisibility } = pkg;
// Helper to check if user can access messages for an application
async function checkMessageAccess(userId, applicationId) {
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { 
            candidateId: true,
            job: { 
                select: { 
                    companyId: true, 
                    hiringTeam: { where: { userId } } 
                } 
            }
        }
    });

    if (!application) {
        const error = new Error('Application not found.');
        error.statusCode = 404;
        throw error;
    }

    // User is the candidate OR part of hiring team OR company/platform admin
    const isCandidate = application.candidateId === userId; // This assumes Candidate ID can be a User ID, adjust if not
    const isHiringTeamMember = application.job.hiringTeam && application.job.hiringTeam.length > 0;
    
    if (isCandidate) return { canAccess: true, isCandidate: true, companyId: application.job.companyId };

    if (isHiringTeamMember) return { canAccess: true, isCandidate: false, companyId: application.job.companyId };

    // Check for company admin or platform admin
    const companyMember = await prisma.companyMember.findFirst({
        where: { userId, companyId: application.job.companyId, role: CompanyMemberRole.RECRUITING_ADMIN }
    });
    const platformUser = await prisma.user.findUnique({ where: { id: userId } });

    if (companyMember || platformUser?.role === UserRole.MEGA_ADMIN) {
        return { canAccess: true, isCandidate: false, companyId: application.job.companyId };
    }
    
    const error = new Error('Forbidden: You do not have permission to access messages for this application.');
    error.statusCode = 403;
    throw error;
}


class MessagingService {
  async sendMessage(senderId, applicationId, messageData) {
    const { content, isInternalNote = false, visibility, attachments } = messageData;
    const access = await checkMessageAccess(senderId, applicationId);

    if (isInternalNote && access.isCandidate) {
        const error = new Error('Candidates cannot send internal notes.');
        error.statusCode = 403;
        throw error;
    }
    if (isInternalNote && !visibility) {
        const error = new Error('Visibility is required for internal notes.');
        error.statusCode = 400;
        throw error;
    }
    if (visibility && !Object.values(CommentVisibility).includes(visibility)) {
        const error = new Error(`Invalid visibility type: ${visibility}`);
        error.statusCode = 400;
        throw error;
    }


    // Get or create message thread
    const thread = await prisma.messageThread.upsert({
      where: { applicationId },
      create: { applicationId },
      update: {},
    });

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId,
        content,
        isInternalNote,
        visibility: isInternalNote ? visibility : null, // Visibility only for internal notes
        attachments: attachments || [], // Ensure it's an array
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        // thread: { include: { application: { select: { id: true, candidateId: true, jobId: true }}}} // If needed
      }
    });

    // TODO: Trigger notification for recipient(s)
    // If not an internal note, notify candidate (if candidate has a user account)
    // If an internal note with mentions, notify mentioned users.

    return message;
  }

  async getMessagesForApplication(userId, applicationId, queryParams) {
    const access = await checkMessageAccess(userId, applicationId);
    const { page = 1, limit = 20 } = queryParams;
    const skip = (page - 1) * limit;

    const thread = await prisma.messageThread.findUnique({ where: { applicationId } });
    if (!thread) {
      return { data: [], currentPage: 1, totalPages: 0, totalMessages: 0 }; // No messages yet
    }

    // Filter messages based on user's role and message visibility
    const whereClause = { threadId: thread.id };
    if (access.isCandidate) { // Candidate only sees non-internal notes
        whereClause.isInternalNote = false;
    } else { // Hiring team member
        // Logic to filter internal notes based on user's role (req.user.role, req.user.companyMember.role)
        // For simplicity, MEGA_ADMIN and RECRUITING_ADMIN see all. HIRING_MANAGER sees PUBLIC and PRIVATE. REVIEWER sees PUBLIC.
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { companyMemberships: { where: { companyId: access.companyId } } } });
        const companyRole = user?.companyMemberships?.[0]?.role;

        if (user?.role !== UserRole.MEGA_ADMIN && companyRole !== CompanyMemberRole.RECRUITING_ADMIN) {
            const allowedVisibilities = [CommentVisibility.PUBLIC];
            if (companyRole === CompanyMemberRole.HIRING_MANAGER) {
                allowedVisibilities.push(CommentVisibility.PRIVATE);
            }
            // This OR condition allows non-internal messages OR internal messages with allowed visibility
            whereClause.OR = [
                { isInternalNote: false },
                { isInternalNote: true, visibility: { in: allowedVisibilities } }
            ];
        }
        // If user is MEGA_ADMIN or RECRUITING_ADMIN, no additional filter needed for internal notes beyond threadId
    }


    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { sentAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    const totalMessages = await prisma.message.count({ where: whereClause });
    
    return {
        data: messages.reverse(), // Show oldest first for chat UIs usually
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages
    };
  }
}

export default new MessagingService();