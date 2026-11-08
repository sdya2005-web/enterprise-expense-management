package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.dto.BudgetRequest;
import com.enterprise.expense.model.Budget;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.AuditService;
import com.enterprise.expense.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

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
    public ResponseEntity<List<Budget>> getBudgets(
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "departmentId", required = false) Long departmentId) {

        if (departmentId != null) {
            return ResponseEntity.ok(budgetService.getBudgetsByDepartment(departmentId));
        }

        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        int targetMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        return ResponseEntity.ok(budgetService.getBudgetsByYearAndMonth(targetYear, targetMonth));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setBudget(@RequestBody BudgetRequest request, Authentication auth) {
        try {
            Budget budget = budgetService.setBudget(request);
            User current = getCurrentUser(auth);
            auditService.log(current, "UPDATE_BUDGET", "BUDGET", budget.getId(), 
                    "Updated budget for Department " + budget.getDepartment().getName() + " to $" + budget.getAllocatedAmount());
            return ResponseEntity.ok(budget);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
