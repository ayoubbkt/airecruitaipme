package com.recruitpme.companyservice.service;

import com.recruitpme.companyservice.dto.DepartmentDTO;
import com.recruitpme.companyservice.dto.CreateUpdateDepartmentDTO;
import com.recruitpme.companyservice.entity.Department;
import com.recruitpme.companyservice.exception.ResourceNotFoundException;
import com.recruitpme.companyservice.repository.CompanyRepository;
import com.recruitpme.companyservice.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {


    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public List<DepartmentDTO> getCompanyDepartments(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        List<Department> departments = departmentRepository.findByCompanyId(companyId);

        return departments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentDTO getDepartmentById(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        return convertToDTO(department);
    }

    @Override
    @Transactional
    public DepartmentDTO createDepartment(Long companyId, CreateUpdateDepartmentDTO departmentDTO) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }

        Department department = new Department();
        department.setCompanyId(companyId);
        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());

        Department savedDepartment = departmentRepository.save(department);

        return convertToDTO(savedDepartment);
    }

    @Override
    @Transactional
    public DepartmentDTO updateDepartment(Long departmentId, CreateUpdateDepartmentDTO departmentDTO) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());

        Department updatedDepartment = departmentRepository.save(department);

        return convertToDTO(updatedDepartment);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }

        departmentRepository.deleteById(departmentId);
    }

    private DepartmentDTO convertToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());

        return dto;
    }
}