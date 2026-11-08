package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.model.Notification;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication auth) {
        User currentUser = getCurrentUser(auth);
        if (currentUser == null) return ResponseEntity.ok(Collections.emptyList());

        return ResponseEntity.ok(notificationService.getUserNotifications(currentUser.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        User currentUser = getCurrentUser(auth);
        if (currentUser != null) {
            notificationService.markAllAsRead(currentUser.getId());
        }
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
