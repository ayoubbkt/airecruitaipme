package com.recruitpme.apigateway.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

/**
 * This class validates if a route should be secured or not
 */
@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/forgot-password",
            "/api/auth/reset-password"
    );

    /**
     * Predicate to test if a request is for a secured endpoint
     * @param request The HTTP request to check
     * @return true if the request should be secured, false otherwise
     */
    public boolean isSecured(ServerHttpRequest request) {
        return openApiEndpoints
                .stream()
                .noneMatch(uri -> request.getURI().getPath().contains(uri));
    }
}