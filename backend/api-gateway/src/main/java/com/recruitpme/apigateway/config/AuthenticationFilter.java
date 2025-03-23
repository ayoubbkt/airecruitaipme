package com.recruitpme.apigateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {


    private final WebClient.Builder webClientBuilder;
    private final RouteValidator routeValidator;

    public AuthenticationFilter(WebClient.Builder webClientBuilder, RouteValidator routeValidator) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
        this.routeValidator = routeValidator;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Skip validation for non-secured endpoints
            if (!routeValidator.isSecured(request)) {
                log.debug("Skipping authentication for non-secured endpoint: {}", request.getURI());
                return chain.filter(exchange);
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Authorization header missing for request: {}", request.getURI());
                return onError(exchange, "Authorization header is missing", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header for request: {}", request.getURI());
                return onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            log.debug("Validating token: {} for request: {}", token, request.getURI());

            // Validate token with auth service
            return webClientBuilder.build()
                    .get()
                    .uri("http://localhost:8081/api/auth/validate-token?token=" + token)
                    .retrieve()
                    .onStatus(HttpStatus::isError, response -> {
                        log.error("Error validating token: {} from GET {} - Status: {}", token, request.getURI(), response.statusCode());
                        return Mono.error(new RuntimeException("Token validation failed: " + response.statusCode()));
                    })
                    .bodyToMono(Boolean.class)
                    .flatMap(isValid -> {
                        if (isValid) {
                            log.debug("Token validated successfully for request: {}", request.getURI());
                            return chain.filter(exchange);
                        } else {
                            log.warn("Invalid token for request: {}", request.getURI());
                            return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
                        }
                    })
                    .onErrorResume(error -> {
                        log.error("Error during token validation for request: {} - Error: {}", request.getURI(), error.getMessage());
                        return onError(exchange, "Token validation failed: " + error.getMessage(), HttpStatus.UNAUTHORIZED);
                    });
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    public static class Config {
        // Configuration properties if needed
    }
}