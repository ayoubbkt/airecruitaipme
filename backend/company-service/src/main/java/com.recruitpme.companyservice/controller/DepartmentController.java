package com.recruitpme.companyservice.controller;

import com.recruitpme.companyservice.dto.DepartmentDTO;
import com.recruitpme.companyservice.dto.CreateUpdateDepartmentDTO;
import com.recruitpme.companyservice.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/company/departments")
public class DepartmentController {


    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentDTO>> getCompanyDepartments() {
        // Assuming a default company ID for simplicity
        Long companyId = 1L;
        List<DepartmentDTO> departments = departmentService.getCompanyDepartments(companyId);
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(@PathVariable Long id) {
        DepartmentDTO department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(department);
    }

    @PostMapping
    public ResponseEntity<DepartmentDTO> createDepartment(@Valid @RequestBody CreateUpdateDepartmentDTO departmentDTO) {
        // Assuming a default company ID for simplicity
        Long companyId = 1L;
        DepartmentDTO createdDepartment = departmentService.createDepartment(companyId, departmentDTO);
        return ResponseEntity.ok(createdDepartment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDTO> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody CreateUpdateDepartmentDTO departmentDTO) {

        DepartmentDTO updatedDepartment = departmentService.updateDepartment(id, departmentDTO);
        return ResponseEntity.ok(updatedDepartment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}