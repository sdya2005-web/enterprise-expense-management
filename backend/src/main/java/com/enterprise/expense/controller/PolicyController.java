package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.model.ExpensePolicy;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.ExpensePolicyRepository;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    @Autowired
    private ExpensePolicyRepository policyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<ExpensePolicy>> getAllPolicies() {
        return ResponseEntity.ok(policyRepository.findAll());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePolicy(@PathVariable Long id, @RequestBody ExpensePolicy update, Authentication auth) {
        return policyRepository.findById(id).map(policy -> {
            if (update.getMaxLimit() != null) policy.setMaxLimit(update.getMaxLimit());
            if (update.getReceiptRequired() != null) policy.setReceiptRequired(update.getReceiptRequired());
            if (update.getDescription() != null) policy.setDescription(update.getDescription());
            if (update.getIsActive() != null) policy.setIsActive(update.getIsActive());

            ExpensePolicy saved = policyRepository.save(policy);

            User current = getCurrentUser(auth);
            auditService.log(current, "UPDATE_POLICY", "POLICY", saved.getId(), 
                    "Updated policy for " + saved.getCategory().getDisplayName() + ": max limit $" + saved.getMaxLimit());

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
