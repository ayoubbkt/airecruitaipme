package com.recruitpme.authservice.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Cette implémentation est simplifiée pour débloquer le démarrage
        // En production, vous récupéreriez les utilisateurs depuis votre base de données
        if ("admin@example.com".equals(username)) {
            return User.builder()
                    .username("admin@example.com")
                    .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG") // "password" encodé avec BCrypt
                    .roles("ADMIN")
                    .build();
        }
        throw new UsernameNotFoundException("User not found: " + username);
    }
}
