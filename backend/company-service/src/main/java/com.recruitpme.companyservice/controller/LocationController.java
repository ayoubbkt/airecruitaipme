package com.recruitpme.companyservice.controller;

import com.recruitpme.companyservice.dto.CompanyLocationDTO;
import com.recruitpme.companyservice.dto.CreateUpdateLocationDTO;
import com.recruitpme.companyservice.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/company/locations")
public class LocationController {


    @Autowired
    private LocationService locationService;

    @GetMapping
    public ResponseEntity<List<CompanyLocationDTO>> getCompanyLocations() {
        // Assuming a default company ID for simplicity
        Long companyId = 1L;
        List<CompanyLocationDTO> locations = locationService.getCompanyLocations(companyId);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyLocationDTO> getLocationById(@PathVariable Long id) {
        CompanyLocationDTO location = locationService.getLocationById(id);
        return ResponseEntity.ok(location);
    }

    @PostMapping
    public ResponseEntity<CompanyLocationDTO> addLocation(@Valid @RequestBody CreateUpdateLocationDTO locationDTO) {
        // Assuming a default company ID for simplicity
        Long companyId = 1L;
        CompanyLocationDTO addedLocation = locationService.addCompanyLocation(companyId, locationDTO);
        return ResponseEntity.ok(addedLocation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyLocationDTO> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody CreateUpdateLocationDTO locationDTO) {

        CompanyLocationDTO updatedLocation = locationService.updateCompanyLocation(id, locationDTO);
        return ResponseEntity.ok(updatedLocation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteCompanyLocation(id);
        return ResponseEntity.noContent().build();
    }
}