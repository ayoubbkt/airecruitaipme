package com.recruitpme.notificationservice.config;

import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // Add any common headers here if needed
            requestTemplate.header("Content-Type", "application/json");
        };
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            // Custom error handling for feign clients
            if (response.status() == 404) {
                return new RuntimeException("Resource not found");
            }

            // Default handling for other errors
            return new RuntimeException("Error during service communication");
        };
    }
}