package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.dto.ApprovalRequest;
import com.enterprise.expense.dto.ExpenseRequest;
import com.enterprise.expense.model.*;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createExpense(
            @RequestParam("title") String title,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "projectId", required = false) Long projectId,
            @RequestParam("category") ExpenseCategory category,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("expenseDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expenseDate,
            @RequestParam("businessPurpose") String businessPurpose,
            @RequestParam("paymentMethod") PaymentMethod paymentMethod,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            Authentication auth) {

        try {
            User currentUser = getCurrentUser(auth);
            if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

            ExpenseRequest req = new ExpenseRequest();
            req.setTitle(title);
            req.setUserId(userId != null ? userId : currentUser.getId());
            req.setEmployeeId(employeeId);
            req.setDepartmentId(departmentId);
            req.setProjectId(projectId);
            req.setCategory(category);
            req.setAmount(amount);
            req.setExpenseDate(expenseDate);
            req.setBusinessPurpose(businessPurpose);
            req.setPaymentMethod(paymentMethod);

            Expense saved = expenseService.createExpense(req, receipt, currentUser);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "errorType", "DUPLICATE_RECEIPT"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to submit expense: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllExpenses(
            @RequestParam(value = "status", required = false) ExpenseStatus status,
            @RequestParam(value = "category", required = false) ExpenseCategory category,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            Authentication auth) {

        User currentUser = getCurrentUser(auth);
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        List<Expense> list;
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            list = expenseService.getAllExpenses();
        } else if (currentUser.getRole() == Role.ROLE_MANAGER) {
            list = (currentUser.getDepartment() != null)
                    ? expenseService.getExpensesByDepartment(currentUser.getDepartment().getId())
                    : expenseService.getAllExpenses();
        } else if (currentUser.getRole() == Role.ROLE_FINANCE) {
            list = expenseService.getAllExpenses();
        } else {
            // Employee only gets their own
            list = expenseService.getExpensesByUser(currentUser.getId());
        }

        // Apply filters in-memory
        if (status != null) {
            list = list.stream().filter(e -> e.getStatus() == status).toList();
        }
        if (category != null) {
            list = list.stream().filter(e -> e.getCategory() == category).toList();
        }
        if (departmentId != null) {
            list = list.stream().filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(departmentId)).toList();
        }

        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id, Authentication auth) {
        User currentUser = getCurrentUser(auth);
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<?> getPendingApprovals(Authentication auth) {
        User currentUser = getCurrentUser(auth);
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        List<Expense> pending = expenseService.getPendingApprovalsForUser(currentUser);
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/for-finance")
    public ResponseEntity<?> getForFinance(Authentication auth) {
        User currentUser = getCurrentUser(auth);
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        List<Expense> forFinance = expenseService.getApprovedForFinance();
        return ResponseEntity.ok(forFinance);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> approveExpense(@PathVariable Long id, @RequestBody(required = false) ApprovalRequest request, Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            Expense updated = expenseService.approveExpense(id, request, currentUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> rejectExpense(@PathVariable Long id, @RequestBody ApprovalRequest request, Authentication auth) {
        try {
            User currentUser = getCurrentUser(auth);
            Expense updated = expenseService.rejectExpense(id, request, currentUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
