package com.recruitpme.companyservice.repository;

import com.recruitpme.companyservice.entity.CompanyLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyLocationRepository extends JpaRepository<CompanyLocation, Long> {
    List<CompanyLocation> findByCompanyId(Long companyId);
    void deleteByCompanyId(Long companyId);
}
