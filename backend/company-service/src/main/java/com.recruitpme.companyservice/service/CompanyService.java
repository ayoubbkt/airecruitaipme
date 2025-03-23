package com.recruitpme.companyservice.service;

import com.recruitpme.companyservice.dto.CompanyDTO;
import com.recruitpme.companyservice.dto.CreateUpdateCompanyDTO;

public interface CompanyService {
    CompanyDTO getCompanyProfile(Long companyId);
    CompanyDTO updateCompanyProfile(Long companyId, CreateUpdateCompanyDTO companyDTO);
    CompanyDTO createCompany(CreateUpdateCompanyDTO companyDTO);
    void deleteCompany(Long companyId);
}
