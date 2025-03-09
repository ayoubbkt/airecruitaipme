
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
            if (routeValidator.isSecured.test(request)) {
                if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, "Authorization header is missing", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
                }

                String token = authHeader.substring(7);

                // Validate token with auth service
                return webClientBuilder.build()
                        .get()
                        .uri("http://auth-service/api/auth/validate-token?token=" + token)
                        .retrieve()
                        .bodyToMono(Boolean.class)
                        .flatMap(isValid -> {
                            if (isValid) {
                                return chain.filter(exchange);
                            } else {
                                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
                            }
                        })
                        .onErrorResume(error -> {
                            log.error("Error validating token: {}", error.getMessage());
                            return onError(exchange, "Token validation failed", HttpStatus.INTERNAL_SERVER_ERROR);
                        });
            }

            return chain.filter(exchange);
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