package com.recruitpme.companyservice.controller;

import com.recruitpme.companyservice.dto.CompanyDTO;
import com.recruitpme.companyservice.dto.CreateUpdateCompanyDTO;
import com.recruitpme.companyservice.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/company")
public class CompanyController {


    @Autowired
    private CompanyService companyService;

    @GetMapping("/profile")
    public ResponseEntity<CompanyDTO> getCompanyProfile() {
        // Assuming a default company ID for simplicity, in a real app this would come from authentication
        Long companyId = 1L;
        CompanyDTO company = companyService.getCompanyProfile(companyId);
        return ResponseEntity.ok(company);
    }

    @PutMapping("/profile")
    public ResponseEntity<CompanyDTO> updateCompanyProfile(@Valid @RequestBody CreateUpdateCompanyDTO companyDTO) {
        // Assuming a default company ID for simplicity
        Long companyId = 1L;
        CompanyDTO updatedCompany = companyService.updateCompanyProfile(companyId, companyDTO);
        return ResponseEntity.ok(updatedCompany);
    }

    @PostMapping
    public ResponseEntity<CompanyDTO> createCompany(@Valid @RequestBody CreateUpdateCompanyDTO companyDTO) {
        CompanyDTO createdCompany = companyService.createCompany(companyDTO);
        return ResponseEntity.ok(createdCompany);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}