package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.dto.ReimbursementRequest;
import com.enterprise.expense.model.Reimbursement;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.ReimbursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reimbursements")
public class ReimbursementController {

    @Autowired
    private ReimbursementService reimbursementService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Reimbursement>> getAllReimbursements() {
        return ResponseEntity.ok(reimbursementService.getAllReimbursements());
    }

    @PostMapping("/process/{expenseId}")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public ResponseEntity<?> processReimbursement(
            @PathVariable Long expenseId,
            @RequestBody ReimbursementRequest request,
            Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            Reimbursement result = reimbursementService.processReimbursement(expenseId, request, currentUser);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
