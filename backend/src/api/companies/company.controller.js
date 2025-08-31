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

  async updateCompany(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      console.log('Requête reçue pour mise à jour:', { id, data });
  
      const updatedCompany = await CompanyService.updateCompany(id, req.user.id, req.user.role, data);
      console.log('Entreprise mise à jour:', updatedCompany);
  
      res.status(200).json({
        message: 'Company updated successfully',
        data: updatedCompany,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      next(error);
    }
  }

  async getDepartments(req, res, next) {
    try {
      const { companyId } = req.params;
      const departments = await CompanyService.getDepartments(companyId, req.user.id, req.user.role);
      res.status(200).json({ data: departments });
    } catch (error) {
      next(error);
    }
  }
  
  async createDepartment(req, res, next) {
    try {
      const { companyId } = req.params;
      const department = await CompanyService.createDepartment(companyId, req.user.id, req.user.role, req.body);
      res.status(201).json({ message: 'Department created successfully', data: department });
    } catch (error) {
      next(error);
    }
  }
  
  async updateDepartment(req, res, next) {
    try {
      const { companyId, departmentId } = req.params;
      const updatedDepartment = await CompanyService.updateDepartment(companyId, departmentId, req.user.id, req.user.role, req.body);
      res.status(200).json({ message: 'Department updated successfully', data: updatedDepartment });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteDepartment(req, res, next) {
    try {
      const { companyId, departmentId } = req.params;
      await CompanyService.deleteDepartment(companyId, departmentId, req.user.id, req.user.role);
      res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  
  async getCompanyLocations(req, res, next) {
    try {
      const { companyId } = req.params;
      const locations = await CompanyService.getCompanyLocations(companyId, req.user.id, req.user.role);
      res.status(200).json({ data: locations });
    } catch (error) {
      next(error);
    }
  }
  
  async addCompanyLocation(req, res, next) {
    try {
      const { companyId } = req.params;
      const data = req.body;
      console.log('Données reçues pour ajout d\'emplacement:', { companyId, data });
  
      const location = await CompanyService.addCompanyLocation(companyId, req.user.id, req.user.role, data);
      res.status(201).json({ message: 'Location added successfully', data: location });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'emplacement:', error);
      next(error);
    }
  }
  
  async updateCompanyLocation(req, res, next) {
    try {
      const { companyId, locationId } = req.params;
      const updatedLocation = await CompanyService.updateCompanyLocation(companyId, locationId, req.user.id, req.user.role, req.body);
      res.status(200).json({ message: 'Location updated successfully', data: updatedLocation });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteCompanyLocation(req, res, next) {
    try {
      const { companyId, locationId } = req.params;
      await CompanyService.deleteCompanyLocation(companyId, locationId, req.user.id, req.user.role);
      res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  
}

export default new CompanyController();