import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { CompanyMemberRole, UserRole } = pkg;

class CompanyService {
  async createCompany(userId, companyData) {
    const { name, website, phoneNumber, description } = companyData;
    // TODO: Validate companyData

    const company = await prisma.company.create({
      data: {
        name,
        website,
        phoneNumber,
        description,
        ownerId: userId,
        members: { // Automatically add the creator as a company admin
          create: {
            userId: userId,
            role: CompanyMemberRole.RECRUITING_ADMIN // Or a more encompassing "OWNER" role if you add it
          }
        },
        // Create default careers page settings
        careersPageSettings: {
          create: {} // Empty object, will use defaults from schema or can be populated
        }
      },
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
        members: { include: { user: { select: { id: true, email: true } } } },
        careersPageSettings: true
      }
    });
    return company;
  }

  async getCompanyById(companyId, userId, userRole) {
    // Check if user is a member of the company or a MEGA_ADMIN
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
        departments: true,
        locations: true,
        members: { 
          include: { 
            user: { select: { id: true, email: true, firstName: true, lastName: true } } 
          }
        },
        // Include other relations as needed
      }
    });

    if (!company) {
      const error = new Error('Company not found.');
      error.statusCode = 404;
      throw error;
    }

    const isMember = company.members.some(member => member.userId === userId);
    if (!isMember && userRole !== UserRole.MEGA_ADMIN) {
        const error = new Error('Forbidden: You are not authorized to view this company.');
        error.statusCode = 403;
        throw error;
    }
    return company;
  }

  async getUserCompanies(userId) {
    // Companies where the user is a member
    const companies = await prisma.company.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: { select: { id: true, email: true } },
        _count: { select: { jobs: true, members: true } } // Example counts
      },
      orderBy: { name: 'asc' }
    });
    return companies;
  }

  async updateCompany(companyId, userId, companyData, userRole) {
    const { name, website, phoneNumber, description } = companyData;
    // TODO: Validate companyData

    const company = await this.getCompanyById(companyId, userId, userRole); // This also handles auth check

    // Further check: only owner or specific company admin role can update
    const member = company.members.find(m => m.userId === userId);
    if (company.ownerId !== userId && userRole !== UserRole.MEGA_ADMIN && (!member || member.role !== CompanyMemberRole.RECRUITING_ADMIN)) {
        const error = new Error('Forbidden: You do not have permission to update this company.');
        error.statusCode = 403;
        throw error;
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        website,
        phoneNumber,
        description,
      },
    });
    return updatedCompany;
  }

  async addMemberToCompany(companyId, actorUserId, actorUserRole, newMemberData) {
    const { email: newMemberEmail, role: newMemberRole } = newMemberData;
    // TODO: Validate newMemberData

    const company = await this.getCompanyById(companyId, actorUserId, actorUserRole); // Auth check

    // Check if actor has permission to add members (e.g., is company admin or owner)
    const actorMember = company.members.find(m => m.userId === actorUserId);
    if (company.ownerId !== actorUserId && actorUserRole !== UserRole.MEGA_ADMIN && (!actorMember || actorMember.role !== CompanyMemberRole.RECRUITING_ADMIN)) {
        const error = new Error('Forbidden: You do not have permission to add members to this company.');
        error.statusCode = 403;
        throw error;
    }
    
    const userToAdd = await prisma.user.findUnique({ where: { email: newMemberEmail } });
    if (!userToAdd) {
      const error = new Error(`User with email ${newMemberEmail} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const existingMembership = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId: userToAdd.id } }
    });

    if (existingMembership) {
      const error = new Error('User is already a member of this company.');
      error.statusCode = 409;
      throw error;
    }
    
    // Ensure newMemberRole is a valid CompanyMemberRole
    if (!Object.values(CompanyMemberRole).includes(newMemberRole)) {
        const error = new Error(`Invalid role: ${newMemberRole}.`);
        error.statusCode = 400;
        throw error;
    }


    const newMembership = await prisma.companyMember.create({
      data: {
        companyId,
        userId: userToAdd.id,
        role: newMemberRole,
      },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } }
    });
    return newMembership;
  }

  async removeMemberFromCompany(companyId, actorUserId, actorUserRole, memberToRemoveId) {
    const company = await this.getCompanyById(companyId, actorUserId, actorUserRole); // Auth check

    // Check if actor has permission to remove members
    const actorMember = company.members.find(m => m.userId === actorUserId);
     if (company.ownerId !== actorUserId && actorUserRole !== UserRole.MEGA_ADMIN && (!actorMember || actorMember.role !== CompanyMemberRole.RECRUITING_ADMIN)) {
        const error = new Error('Forbidden: You do not have permission to remove members from this company.');
        error.statusCode = 403;
        throw error;
    }

    // Prevent owner from being removed (owner should transfer ownership or delete company)
    if (company.ownerId === memberToRemoveId) {
      const error = new Error('Cannot remove the company owner. Transfer ownership first.');
      error.statusCode = 400;
      throw error;
    }

    try {
      await prisma.companyMember.delete({
        where: { companyId_userId: { companyId, userId: memberToRemoveId } },
      });
      return { message: 'Member removed successfully.' };
    } catch (e) {
      if (e.code === 'P2025') { // Record to delete not found
        const error = new Error('Member not found in this company.');
        error.statusCode = 404;
        throw error;
      }
      throw e; // Re-throw other errors
    }
  }

  async getCompanyMembers(companyId, actorUserId, actorUserRole) {
    await this.getCompanyById(companyId, actorUserId, actorUserRole); // Auth check
    
    return prisma.companyMember.findMany({
        where: { companyId },
        include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } }
        },
        orderBy: { user: { firstName: 'asc' } }
    });
  }
}

export default new CompanyService();