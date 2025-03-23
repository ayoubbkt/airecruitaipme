package com.recruitpme.authservice;

import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;

public class PasswordTest {

    public static void main(String[] args) {
        String secret = Base64.getEncoder().encodeToString(
                Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded()
        );
        System.out.println("Secure JWT secret (Base64): " + secret);
    }
}
