package com.recruitpme.companyservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;


public class JwtTokenFilter extends OncePerRequestFilter {

    @Value("${jwt.secret:recruitpmeSecretKey}")
    private String jwtSecret;

    @Value("${jwt.header:Authorization}")
    private String jwtHeader;

    @Value("${jwt.prefix:Bearer }")
    private String jwtPrefix;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Get authorization header and validate
        final String header = request.getHeader(jwtHeader);
        if (header == null || !header.startsWith(jwtPrefix)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Get jwt token and validate
        final String token = header.substring(jwtPrefix.length());
        try {
            // Parse the token
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret.getBytes())
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();

            if (username != null) {
                @SuppressWarnings("unchecked")
                List<String> authorities = (List<String>) claims.get("roles");

                // Create auth object
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, null,
                        authorities.stream()
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList())
                );

                // Authenticate the user
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}