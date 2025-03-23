package com.recruitpme.companyservice.service;

import com.recruitpme.companyservice.dto.CompanyLocationDTO;
import com.recruitpme.companyservice.dto.CreateUpdateLocationDTO;
import com.recruitpme.companyservice.entity.CompanyLocation;
import com.recruitpme.companyservice.exception.ResourceNotFoundException;
import com.recruitpme.companyservice.repository.CompanyLocationRepository;
import com.recruitpme.companyservice.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private CompanyLocationRepository locationRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public List<CompanyLocationDTO> getCompanyLocations(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        List<CompanyLocation> locations = locationRepository.findByCompanyId(companyId);

        return locations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CompanyLocationDTO getLocationById(Long locationId) {
        CompanyLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + locationId));

        return convertToDTO(location);
    }

    @Override
    @Transactional
    public CompanyLocationDTO addCompanyLocation(Long companyId, CreateUpdateLocationDTO locationDTO) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        CompanyLocation location = new CompanyLocation();
        location.setCompanyId(companyId);
        location.setAddress(locationDTO.getAddress());
        location.setCity(locationDTO.getCity());
        location.setCountry(locationDTO.getCountry());
        location.setPostalCode(locationDTO.getPostalCode());
        location.setHeadquarters(locationDTO.isHeadquarters());

        CompanyLocation savedLocation = locationRepository.save(location);

        return convertToDTO(savedLocation);
    }

    @Override
    @Transactional
    public CompanyLocationDTO updateCompanyLocation(Long locationId, CreateUpdateLocationDTO locationDTO) {
        CompanyLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + locationId));

        location.setAddress(locationDTO.getAddress());
        location.setCity(locationDTO.getCity());
        location.setCountry(locationDTO.getCountry());
        location.setPostalCode(locationDTO.getPostalCode());
        location.setHeadquarters(locationDTO.isHeadquarters());

        CompanyLocation updatedLocation = locationRepository.save(location);

        return convertToDTO(updatedLocation);
    }

    @Override
    @Transactional
    public void deleteCompanyLocation(Long locationId) {
        if (!locationRepository.existsById(locationId)) {
            throw new ResourceNotFoundException("Location not found with id: " + locationId);
        }

        locationRepository.deleteById(locationId);
    }

    private CompanyLocationDTO convertToDTO(CompanyLocation location) {
        CompanyLocationDTO dto = new CompanyLocationDTO();
        dto.setId(location.getId());
        dto.setAddress(location.getAddress());
        dto.setCity(location.getCity());
        dto.setCountry(location.getCountry());
        dto.setPostalCode(location.getPostalCode());
        dto.setHeadquarters(location.isHeadquarters());

        return dto;
    }
}