import CompanyService from './company.service.js';

class CompanyController {
  async createCompany(req, res, next) {
    try {
      // TODO: Validation for req.body
      const company = await CompanyService.createCompany(req.user.id, req.body);
      res.status(201).json({ message: 'Company created successfully', data: company });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await CompanyService.getCompanyById(req.params.companyId, req.user.id, req.user.role);
      res.status(200).json({ data: company });
    } catch (error) {
      next(error);
    }
  }

  async getUserCompanies(req, res, next) {
    try {
      const companies = await CompanyService.getUserCompanies(req.user.id);
      res.status(200).json({ data: companies });
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      // TODO: Validation for req.body
      const updatedCompany = await CompanyService.updateCompany(req.params.companyId, req.user.id, req.body, req.user.role);
      res.status(200).json({ message: 'Company updated successfully', data: updatedCompany });
    } catch (error) {
      next(error);
    }
  }

  async addMemberToCompany(req, res, next) {
    try {
      // TODO: Validation for req.body (email, role)
      const newMember = await CompanyService.addMemberToCompany(req.params.companyId, req.user.id, req.user.role, req.body);
      res.status(201).json({ message: 'Member added successfully', data: newMember });
    } catch (error) {
      next(error);
    }
  }

  async removeMemberFromCompany(req, res, next) {
    try {
      const result = await CompanyService.removeMemberFromCompany(req.params.companyId, req.user.id, req.user.role, req.params.memberId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyMembers(req, res, next) {
    try {
        const members = await CompanyService.getCompanyMembers(req.params.companyId, req.user.id, req.user.role);
        res.status(200).json({ data: members });
    } catch (error) {
        next(error);
    }
  }
}

export default new CompanyController();