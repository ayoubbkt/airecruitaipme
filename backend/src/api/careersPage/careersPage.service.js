import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole, JobStatus } = pkg;
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

class CareersPageService {
  async getCareersPageSettings(companyId) { // Publicly accessible for viewing
    const settings = await prisma.careersPageSetting.findUnique({
      where: { companyId },
      include: { company: { select: { name: true, description: true, website: true } } } // Include company branding info
    });
    if (!settings) {
      // Return default settings or an indication that it's not configured
      // For now, let's assume a company always has a setting record (created with company)
      const company = await prisma.company.findUnique({where: {id: companyId}, select: {name: true, description: true, website: true}});
      if (!company) {
          const error = new Error('Company not found, cannot retrieve career page settings.');
          error.statusCode = 404;
          throw error;
      }
      // Create a default setting if it doesn't exist (should be done on company creation)
      return prisma.careersPageSetting.upsert({
          where: { companyId },
          create: { companyId },
          update: {},
          include: { company: { select: { name: true, description: true, website: true } } }
      });
    }
    return settings;
  }

  async updateCareersPageSettings(userId, companyId, settingsData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { 
        logoUrl, primaryColor, focusColor, hyperlinkColor, 
        googleAnalyticsId, trackingPixelUrl, customCSS, embedJobsCode,
        // Company branding like description, name, website should be updated on Company model
    } = settingsData;

    // Update company details if provided (marketing name, description)
    const companyUpdateData = {};
    if (settingsData.companyName) companyUpdateData.name = settingsData.companyName; // Assuming 'name' is marketing name
    if (settingsData.companyDescription) companyUpdateData.description = settingsData.companyDescription;
    
    if (Object.keys(companyUpdateData).length > 0) {
        await prisma.company.update({
            where: { id: companyId },
            data: companyUpdateData
        });
    }

    return prisma.careersPageSetting.upsert({ // Use upsert to create if not exists
      where: { companyId },
      create: {
        companyId,
        logoUrl,
        primaryColor,
        focusColor,
        hyperlinkColor,
        googleAnalyticsId,
        trackingPixelUrl,
        customCSS,
        embedJobsCode,
      },
      update: {
        logoUrl,
        primaryColor,
        focusColor,
        hyperlinkColor,
        googleAnalyticsId,
        trackingPixelUrl,
        customCSS,
        embedJobsCode,
      },
      include: { company: { select: { name: true, description: true } } }
    });
  }

  // Publicly accessible endpoint to list jobs for a company's careers page
  async getPublishedJobsForCareersPage(companyId, queryParams) {
    const { department, location, search } = queryParams; // Filters
    
    const whereClause = {
      companyId,
      status: JobStatus.PUBLISHED, // Only published jobs
    };

    if (department) { // Assuming department is passed as name or ID
        const dept = await prisma.department.findFirst({ where: { companyId, OR: [{id: department}, {name: department}] }});
        if (dept) whereClause.departmentId = dept.id;
        else return { data: [], totalJobs: 0 }; // No jobs if department filter doesn't match
    }
    if (location) { // Assuming location is city name or ID
        const loc = await prisma.jobLocation.findFirst({ where: { companyId, OR: [{id: location}, {city: location}] }}); // Simplified search
        if (loc) whereClause.locationId = loc.id;
        else return { data: [], totalJobs: 0 };
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true, // Maybe a snippet
        employmentType: true,
        workType: true,
        department: { select: { name: true } },
        location: { select: { city: true, country: true, stateRegion: true } },
        createdAt: true, // To show how recent the posting is
        // Do NOT include salary if displaySalary is false (or handle it here)
        salaryMin: true,
        salaryMax: true,
        currency: true,
        payPeriod: true,
        displaySalary: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Filter out salary if not displayable
    const processedJobs = jobs.map(job => {
        if (!job.displaySalary) {
            // eslint-disable-next-line no-unused-vars
            const { salaryMin, salaryMax, currency, payPeriod, ...jobWithoutSalary } = job;
            return jobWithoutSalary;
        }
        return job;
    });

    return { data: processedJobs, totalJobs: processedJobs.length };
  }
}

export default new CareersPageService();