package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.dto.DashboardStatsResponse;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication auth) {
        User currentUser = null;
        if (auth != null && auth.isAuthenticated()) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            currentUser = userRepository.findById(userDetails.getId()).orElse(null);
        }

        DashboardStatsResponse stats = dashboardService.getDashboardStats(currentUser);
        return ResponseEntity.ok(stats);
    }
}
