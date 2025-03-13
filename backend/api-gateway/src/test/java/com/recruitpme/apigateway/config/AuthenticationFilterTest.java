package com.recruitpme.apigateway;

import com.recruitpme.apigateway.config.AuthenticationFilter;
import com.recruitpme.apigateway.config.RouteValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthenticationFilterTest {

    @Mock
    private GatewayFilterChain filterChain;
    
    @Mock
    private RouteValidator routeValidator;
    
    @Mock
    private WebClient.Builder webClientBuilder;
    
    @InjectMocks
    private AuthenticationFilter filter;

    @Test
    public void testSecuredRouteWithoutAuthHeader() {
        // Configure le mock pour que isSecured retourne true (route sécurisée)
        when(routeValidator.isSecured(any(ServerHttpRequest.class))).thenReturn(true);
        
        // Crée une requête sans en-tête d'autorisation
        MockServerHttpRequest request = MockServerHttpRequest
                .get("http://localhost:8080/api/secured-endpoint")
                .build();
        
        // Crée un échange avec notre requête
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        // Exécute le filtre
        GatewayFilter gatewayFilter = filter.apply(new AuthenticationFilter.Config());
        Mono<Void> result = gatewayFilter.filter(exchange, filterChain);
        
        // Vérifie que le filtre se termine correctement
        StepVerifier.create(result)
                .expectComplete()
                .verify();
        
        // Vérifie que le statut est bien UNAUTHORIZED
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        
        // Vérifie que le filtre ne laisse pas passer la requête
        verify(filterChain, never()).filter(any());
    }

    @Test
    public void testSecuredRouteWithInvalidAuthHeader() {
        // Configure le mock pour que isSecured retourne true (route sécurisée)
        when(routeValidator.isSecured(any(ServerHttpRequest.class))).thenReturn(true);
        
        // Crée une requête avec un en-tête d'autorisation invalide
        MockServerHttpRequest request = MockServerHttpRequest
                .get("http://localhost:8080/api/secured-endpoint")
                .header(HttpHeaders.AUTHORIZATION, "Invalid-Format")
                .build();
        
        // Crée un échange avec notre requête
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        // Exécute le filtre
        GatewayFilter gatewayFilter = filter.apply(new AuthenticationFilter.Config());
        Mono<Void> result = gatewayFilter.filter(exchange, filterChain);
        
        // Vérifie que le filtre se termine correctement
        StepVerifier.create(result)
                .expectComplete()
                .verify();
        
        // Vérifie que le statut est bien UNAUTHORIZED
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        
        // Vérifie que le filtre ne laisse pas passer la requête
        verify(filterChain, never()).filter(any());
    }

    @Test
    public void testSecuredRouteWithValidToken() {
        // Configure le mock pour que isSecured retourne true (route sécurisée)
        when(routeValidator.isSecured(any(ServerHttpRequest.class))).thenReturn(true);
        
        // Configure la chaîne de mocks pour la validation du token
        WebClient webClient = mock(WebClient.class);
        WebClient.RequestHeadersUriSpec requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);
        
        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Boolean.class)).thenReturn(Mono.just(true));
        
        when(filterChain.filter(any())).thenReturn(Mono.empty());
        
        // Crée une requête avec un en-tête d'autorisation valide
        MockServerHttpRequest request = MockServerHttpRequest
                .get("http://localhost:8080/api/secured-endpoint")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-token")
                .build();
        
        // Crée un échange avec notre requête
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        // Exécute le filtre
        GatewayFilter gatewayFilter = filter.apply(new AuthenticationFilter.Config());
        Mono<Void> result = gatewayFilter.filter(exchange, filterChain);
        
        // Vérifie que le filtre se termine correctement
        StepVerifier.create(result)
                .expectComplete()
                .verify();
        
        // Vérifie que le filtre laisse passer la requête
        verify(filterChain).filter(exchange);
    }

    @Test
    public void testNonSecuredRoute() {
        // Configure le mock pour que isSecured retourne false (route non sécurisée)
        when(routeValidator.isSecured(any(ServerHttpRequest.class))).thenReturn(false);
        
        when(filterChain.filter(any())).thenReturn(Mono.empty());
        
        // Crée une requête sans en-tête d'autorisation
        MockServerHttpRequest request = MockServerHttpRequest
                .get("http://localhost:8080/api/public-endpoint")
                .build();
        
        // Crée un échange avec notre requête
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        // Exécute le filtre
        GatewayFilter gatewayFilter = filter.apply(new AuthenticationFilter.Config());
        Mono<Void> result = gatewayFilter.filter(exchange, filterChain);
        
        // Vérifie que le filtre se termine correctement
        StepVerifier.create(result)
                .expectComplete()
                .verify();
        
        // Vérifie que le filtre laisse passer la requête
        verify(filterChain).filter(exchange);
    }
}