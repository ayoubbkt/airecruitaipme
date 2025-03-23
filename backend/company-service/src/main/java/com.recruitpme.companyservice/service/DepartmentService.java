package com.recruitpme.companyservice.service;

import com.recruitpme.companyservice.dto.DepartmentDTO;
import com.recruitpme.companyservice.dto.CreateUpdateDepartmentDTO;

import java.util.List;

public interface DepartmentService {
    List<DepartmentDTO> getCompanyDepartments(Long companyId);
    DepartmentDTO getDepartmentById(Long departmentId);
    DepartmentDTO createDepartment(Long companyId, CreateUpdateDepartmentDTO departmentDTO);
    DepartmentDTO updateDepartment(Long departmentId, CreateUpdateDepartmentDTO departmentDTO);
    void deleteDepartment(Long departmentId);
}
