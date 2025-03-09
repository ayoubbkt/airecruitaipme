
package com.recruitpme.apigateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "gateway")
@Data
public class GatewayConfig {

    private List<String> excludedUrls = new ArrayList<>();
}