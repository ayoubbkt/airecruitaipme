package com.recruitpme.companyservice.service;

import com.recruitpme.companyservice.dto.CompanyLocationDTO;
import com.recruitpme.companyservice.dto.CreateUpdateLocationDTO;

import java.util.List;

public interface LocationService {
    List<CompanyLocationDTO> getCompanyLocations(Long companyId);
    CompanyLocationDTO getLocationById(Long locationId);
    CompanyLocationDTO addCompanyLocation(Long companyId, CreateUpdateLocationDTO locationDTO);
    CompanyLocationDTO updateCompanyLocation(Long locationId, CreateUpdateLocationDTO locationDTO);
    void deleteCompanyLocation(Long locationId);
}
