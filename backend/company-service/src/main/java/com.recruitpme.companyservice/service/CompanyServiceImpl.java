package com.recruitpme.companyservice.service;

import com.recruitpme.companyservice.dto.CompanyDTO;
import com.recruitpme.companyservice.dto.CreateUpdateCompanyDTO;
import com.recruitpme.companyservice.entity.Company;
import com.recruitpme.companyservice.exception.ResourceNotFoundException;
import com.recruitpme.companyservice.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired
    private CompanyRepository companyRepository;


    @Override
    public CompanyDTO getCompanyProfile(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        return convertToDTO(company);
    }

    @Override
    @Transactional
    public CompanyDTO updateCompanyProfile(Long companyId, CreateUpdateCompanyDTO companyDTO) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        company.setName(companyDTO.getName());
        company.setWebsite(companyDTO.getWebsite());
        company.setPhone(companyDTO.getPhone());
        company.setLogoUrl(companyDTO.getLogoUrl());
        company.setIndustry(companyDTO.getIndustry());
        company.setCompanySize(companyDTO.getCompanySize());
        company.setDescription(companyDTO.getDescription());

        Company updatedCompany = companyRepository.save(company);

        return convertToDTO(updatedCompany);
    }

    @Override
    @Transactional
    public CompanyDTO createCompany(CreateUpdateCompanyDTO companyDTO) {
        Company company = new Company();
        company.setName(companyDTO.getName());
        company.setWebsite(companyDTO.getWebsite());
        company.setPhone(companyDTO.getPhone());
        company.setLogoUrl(companyDTO.getLogoUrl());
        company.setIndustry(companyDTO.getIndustry());
        company.setCompanySize(companyDTO.getCompanySize());
        company.setDescription(companyDTO.getDescription());

        Company createdCompany = companyRepository.save(company);

        return convertToDTO(createdCompany);
    }

    @Override
    @Transactional
    public void deleteCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        companyRepository.deleteById(companyId);
    }

    private CompanyDTO convertToDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setWebsite(company.getWebsite());
        dto.setPhone(company.getPhone());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setIndustry(company.getIndustry());
        dto.setCompanySize(company.getCompanySize());
        dto.setDescription(company.getDescription());

        return dto;
    }
}