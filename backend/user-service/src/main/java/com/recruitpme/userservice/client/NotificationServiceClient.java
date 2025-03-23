package com.recruitpme.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;


import java.util.Map;

@FeignClient(name = "notification-service", url = "${services.notification-service.url}")
public interface NotificationServiceClient {


    @PostMapping("/api/notifications/email")
    void sendEmail(
            @RequestParam("to") String to,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content);
    
    @PostMapping("/api/notifications/email/template")
    void sendTemplatedEmail(
            @RequestParam("to") String to,
            @RequestParam("templateCode") String templateCode,
            Map<String, Object> data);
}