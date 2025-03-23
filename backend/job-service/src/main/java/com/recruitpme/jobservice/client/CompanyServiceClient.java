package com.recruitpme.jobservice.client;

import com.recruitpme.jobservice.dto.DepartmentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "company-service", url = "${company-service.url}")
public interface CompanyServiceClient {

    @GetMapping("/api/company/departments")
    List<DepartmentDTO> getAllDepartments();

    @GetMapping("/api/company/departments/{id}")
    DepartmentDTO getDepartmentById(@PathVariable("id") Long id);
}