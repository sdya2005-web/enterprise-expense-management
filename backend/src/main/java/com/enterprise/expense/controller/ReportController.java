package com.enterprise.expense.controller;

import com.enterprise.expense.model.Department;
import com.enterprise.expense.model.Expense;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.DepartmentRepository;
import com.enterprise.expense.repository.ExpenseRepository;
import com.enterprise.expense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/financial")
    public ResponseEntity<?> getFinancialReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalExpenses", expenseRepository.sumTotalCompanyExpenses());
        report.put("categoryBreakdown", expenseRepository.findCategoryBreakdown());
        report.put("departmentBreakdown", expenseRepository.findDepartmentBreakdown());
        report.put("monthlyBreakdown", expenseRepository.findMonthlyBreakdown());
        return ResponseEntity.ok(report);
    }

    @GetMapping("/department-analytics")
    public ResponseEntity<?> getDepartmentAnalytics() {
        List<Department> departments = departmentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Department d : departments) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("code", d.getCode());
            map.put("monthlyBudget", d.getMonthlyBudget());
            BigDecimal totalSpent = expenseRepository.sumAmountByDepartmentId(d.getId());
            map.put("totalSpent", totalSpent);
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/employee-tracking")
    public ResponseEntity<?> getEmployeeTracking() {
        List<User> employees = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : employees) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getFullName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("employeeId", u.getEmployeeId());
            map.put("department", u.getDepartment() != null ? u.getDepartment().getName() : "N/A");
            BigDecimal totalSpent = expenseRepository.sumAmountByUserId(u.getId());
            map.put("totalSpent", totalSpent);
            long totalCount = expenseRepository.countByUserId(u.getId());
            map.put("expenseCount", totalCount);
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }
}
