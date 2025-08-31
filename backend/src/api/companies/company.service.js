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
    if (!companyId) {
      const error = new Error('Company ID is required');
      error.statusCode = 400;
      throw error;
    }
  
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        departments: true,
        locations: true,
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
  
    if (!company) {
      const error = new Error('Company not found');
      error.statusCode = 404;
      throw error;
    }
  
    // Vérification des permissions (exemple)
    if (userRole !== 'MEGA_ADMIN' && company.ownerId !== userId) {
      const error = new Error('Unauthorized access to this company');
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

  async updateCompany(companyId, userId, userRole, data) {
    try {
      console.log('Début de la mise à jour:', { companyId, data });
      await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
  
      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: {
          name: data.name,
          website: data.website,
          phoneNumber: data.phoneNumber,
          description: data.description,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          website: true,
          phoneNumber: true,
          description: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      console.log('Résultat de la mise à jour Prisma:', updatedCompany);
      // Vérification immédiate dans la base
      const verifyCompany = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, updatedAt: true },
      });
      console.log('Vérification post-mise à jour:', verifyCompany);
  
      return updatedCompany;
    } catch (error) {
      console.error('Erreur Prisma lors de la mise à jour:', error);
      const err = new Error('Failed to update company');
      err.statusCode = 500;
      err.details = error.message;
      throw err;
    }
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

  async getDepartments(companyId, userId, userRole) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    return prisma.department.findMany({
      where: { companyId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
  
  async createDepartment(companyId, userId, userRole, departmentData) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    const { name } = departmentData;
    return prisma.department.create({
      data: { companyId, name },
      select: { id: true, name: true },
    });
  }
  
  async updateDepartment(companyId, departmentId, userId, userRole, departmentData) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    const { name } = departmentData;
    return prisma.department.update({
      where: { id: departmentId, companyId },
      data: { name },
      select: { id: true, name: true },
    });
  }
  
  async deleteDepartment(companyId, departmentId, userId, userRole) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    try {
      await prisma.department.delete({
        where: { id: departmentId, companyId },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        const error = new Error('Department not found.');
        error.statusCode = 404;
        throw error;
      }
      throw e;
    }
  }
  
  async getCompanyLocations(companyId, userId, userRole) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    return prisma.jobLocation.findMany({
      where: { companyId },
      select: { id: true, address: true, city: true, country: true, zipPostal: true },
      orderBy: { city: 'asc' },
    });
  }
  
  async addCompanyLocation(companyId, userId, userRole, locationData) {
    try {
      await this.getCompanyById(companyId, userId, userRole);
      const { address, city, country, zipPostal } = locationData; // Utilisez zipPostal
      console.log('Données à insérer:', { address, city, country, zipPostal });
  
      return await prisma.jobLocation.create({
        data: { companyId, address, city, country, zipPostal },
        select: { id: true, address: true, city: true, country: true, zipPostal: true },
      });
    } catch (error) {
      console.error('Erreur Prisma:', error);
      throw new Error('Failed to add location');
    }
  }
  
  async updateCompanyLocation(companyId, locationId, userId, userRole, locationData) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    const { address, city, country, zipPostal } = locationData;
    return prisma.jobLocation.update({
      where: { id: locationId, companyId },
      data: { address, city, country, zipPostal },
      select: { id: true, address: true, city: true, country: true, zipPostal: true },
    });
  }
  
  async deleteCompanyLocation(companyId, locationId, userId, userRole) {
    await this.getCompanyById(companyId, userId, userRole); // Vérifie les permissions
    try {
      await prisma.jobLocation.delete({
        where: { id: locationId, companyId },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        const error = new Error('Location not found.');
        error.statusCode = 404;
        throw error;
      }
      throw e;
    }
  }
}

export default new CompanyService();