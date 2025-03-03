package com.recruitpme.apigateway.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.recruitpme.apigateway.model.CV;

public interface CVRepository extends JpaRepository<CV, String> {
}