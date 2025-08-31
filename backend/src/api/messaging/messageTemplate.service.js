import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole } = pkg;

// Helper to check if user has permission to manage message templates
async function checkMessageTemplatePermission(userId, companyId, allowedRoles = [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER]) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || !allowedRoles.includes(membership.role)) {
    const error = new Error('Forbidden: You do not have permission to manage message templates.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

class MessageTemplateService {
  async getMessageTemplates(userId, companyId) {
    await checkMessageTemplatePermission(userId, companyId);

    const templates = await prisma.messageTemplate.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });

    // Séparer les templates en required et custom
    return {
      required: templates.filter(t => t.isRequired).map(t => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        description: t.description,
        content: t.content
      })),
      custom: templates.filter(t => !t.isRequired).map(t => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        content: t.content
      }))
    };
  }

  async getMessageTemplateById(userId, companyId, id) {
    await checkMessageTemplatePermission(userId, companyId);

    const template = await prisma.messageTemplate.findUnique({
      where: { id }
    });

    if (!template || template.companyId !== companyId) {
      const error = new Error('Message template not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      description: template.description,
      content: template.content,
      isRequired: template.isRequired
    };
  }

  async createMessageTemplate(userId, companyId, templateData) {
    await checkMessageTemplatePermission(userId, companyId);

    const { name, subject, content } = templateData;

    if (!name || !subject || !content) {
      throw new Error('Name, subject, and content are required for a message template.');
    }

    return prisma.messageTemplate.create({
      data: {
        companyId,
        name,
        subject,
        content,
        isRequired: false // Les templates créés par l'utilisateur sont toujours custom
      }
    });
  }

  async updateMessageTemplate(userId, companyId, id, templateData) {
    await checkMessageTemplatePermission(userId, companyId);

    const template = await prisma.messageTemplate.findUnique({
      where: { id }
    });

    if (!template || template.companyId !== companyId) {
      const error = new Error('Message template not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const { name, subject, content } = templateData;

    if (!name || !subject || !content) {
      throw new Error('Name, subject, and content are required for a message template.');
    }

    return prisma.messageTemplate.update({
      where: { id },
      data: {
        name,
        subject,
        content
      }
    });
  }

  async deleteMessageTemplate(userId, companyId, id) {
    await checkMessageTemplatePermission(userId, companyId);

    const template = await prisma.messageTemplate.findUnique({
      where: { id }
    });

    if (!template || template.companyId !== companyId) {
      const error = new Error('Message template not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    if (template.isRequired) {
      const error = new Error('Cannot delete a required message template.');
      error.statusCode = 403;
      throw error;
    }

    await prisma.messageTemplate.delete({
      where: { id }
    });

    return { message: 'Message template deleted successfully.' };
  }
}

export default new MessageTemplateService();