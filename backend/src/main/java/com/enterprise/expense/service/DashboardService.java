package com.enterprise.expense.service;

import com.enterprise.expense.dto.DashboardStatsResponse;
import com.enterprise.expense.model.*;
import com.enterprise.expense.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ReimbursementRepository reimbursementRepository;

    public DashboardStatsResponse getDashboardStats(User currentUser) {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();

        // 1. Overall Company Counts
        stats.setTotalEmployees(userRepository.countByActiveTrue());
        stats.setTotalCompanyExpenses(expenseRepository.sumTotalCompanyExpenses());
        stats.setPendingApprovals(expenseRepository.countByStatus(ExpenseStatus.PENDING_APPROVAL));
        stats.setApprovedExpenses(expenseRepository.countByStatus(ExpenseStatus.APPROVED) + 
                                  expenseRepository.countByStatus(ExpenseStatus.FINANCE_VERIFICATION));
        stats.setRejectedExpenses(expenseRepository.countByStatus(ExpenseStatus.REJECTED));
        stats.setTotalReimbursements(reimbursementRepository.sumTotalReimbursed());

        // 2. Monthly Budget & Utilization
        BigDecimal monthlyAllocated = budgetRepository.sumAllocatedByYearAndMonth(currentYear, currentMonth);
        BigDecimal monthlySpent = budgetRepository.sumSpentByYearAndMonth(currentYear, currentMonth);
        stats.setMonthlyCompanyBudget(monthlyAllocated);

        if (monthlyAllocated.compareTo(BigDecimal.ZERO) > 0) {
            double util = monthlySpent.multiply(BigDecimal.valueOf(100))
                    .divide(monthlyAllocated, 2, RoundingMode.HALF_UP).doubleValue();
            stats.setBudgetUtilization(util);
        } else {
            stats.setBudgetUtilization(0.0);
        }

        // 3. Category Breakdown (for Pie / Doughnut Chart)
        List<Object[]> rawCategories = expenseRepository.findCategoryBreakdown();
        List<Map<String, Object>> categoryList = new ArrayList<>();
        for (Object[] row : rawCategories) {
            Map<String, Object> map = new HashMap<>();
            ExpenseCategory cat = (ExpenseCategory) row[0];
            map.put("category", cat.getDisplayName());
            map.put("code", cat.name());
            map.put("totalAmount", row[1]);
            map.put("count", row[2]);
            categoryList.add(map);
        }
        stats.setCategoryBreakdown(categoryList);

        // 4. Department Breakdown (for Department Bar / Pie Chart)
        List<Object[]> rawDepts = expenseRepository.findDepartmentBreakdown();
        List<Map<String, Object>> deptList = new ArrayList<>();
        for (Object[] row : rawDepts) {
            Map<String, Object> map = new HashMap<>();
            map.put("department", row[0]);
            map.put("totalAmount", row[1]);
            map.put("count", row[2]);
            deptList.add(map);
        }
        stats.setDepartmentBreakdown(deptList);

        // 5. Monthly Trend Breakdown
        List<Object[]> rawMonthly = expenseRepository.findMonthlyBreakdown();
        List<Map<String, Object>> monthlyList = new ArrayList<>();
        for (Object[] row : rawMonthly) {
            Map<String, Object> map = new HashMap<>();
            map.put("year", row[0]);
            map.put("month", row[1]);
            map.put("totalAmount", row[2]);
            monthlyList.add(map);
        }
        stats.setMonthlyBreakdown(monthlyList);

        // 6. Recent Transactions Table & Pending Approvals
        stats.setRecentTransactions(expenseRepository.findTop10ByOrderByCreatedAtDesc());
        stats.setPendingApprovalsList(expenseRepository.findByStatusOrderByCreatedAtDesc(ExpenseStatus.PENDING_APPROVAL));
        stats.setDepartmentBudgets(budgetRepository.findByYearAndMonth(currentYear, currentMonth));

        // 7. Role-specific personal summaries
        if (currentUser != null) {
            stats.setPersonalSpentThisMonth(expenseRepository.sumAmountByUserId(currentUser.getId()));
            stats.setPersonalPendingAmount(expenseRepository.sumAmountByUserIdAndStatus(currentUser.getId(), ExpenseStatus.PENDING_APPROVAL));
            stats.setPersonalApprovedAmount(expenseRepository.sumAmountByUserIdAndStatus(currentUser.getId(), ExpenseStatus.REIMBURSED));
            stats.setPersonalRejectedCount(expenseRepository.countByUserIdAndStatus(currentUser.getId(), ExpenseStatus.REJECTED));
        }

        return stats;
    }
}
