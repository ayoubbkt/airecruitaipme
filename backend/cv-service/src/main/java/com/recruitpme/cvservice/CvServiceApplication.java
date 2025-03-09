package com.recruitpme.cvservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication
@EnableFeignClients
@EntityScan("com.recruitpme.cvservice.entity")
@EnableJpaRepositories("com.recruitpme.cvservice.repository")
public class CvServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CvServiceApplication.class, args);
    }
}