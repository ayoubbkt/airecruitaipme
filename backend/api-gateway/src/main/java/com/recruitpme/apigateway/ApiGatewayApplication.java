package com.recruitpme.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication(scanBasePackages = "com.recruitpme.apigateway")
@RestController
public class ApiGatewayApplication {

    private static final Logger logger = LoggerFactory.getLogger(ApiGatewayApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @PostConstruct
    public void init() {
        logger.info("ApiGatewayApplication started, /health endpoint should be available");
    }

    @GetMapping("/health")
    public String healthCheck() {
        logger.info("Health endpoint called");
        return "API Gateway is running";
    }
    @GetMapping("/test")
    public String test() {
        logger.info("Test endpoint called");
        return "Test endpoint is working";
}
}