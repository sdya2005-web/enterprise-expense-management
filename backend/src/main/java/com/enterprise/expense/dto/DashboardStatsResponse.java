package com.enterprise.expense.dto;

import com.enterprise.expense.model.Budget;
import com.enterprise.expense.model.Expense;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalEmployees;
    private BigDecimal totalCompanyExpenses = BigDecimal.ZERO;
    private long pendingApprovals;
    private long approvedExpenses;
    private long rejectedExpenses;
    private BigDecimal totalReimbursements = BigDecimal.ZERO;
    private BigDecimal monthlyCompanyBudget = BigDecimal.ZERO;
    private double budgetUtilization;

    // Charts data
    private List<Map<String, Object>> categoryBreakdown;
    private List<Map<String, Object>> departmentBreakdown;
    private List<Map<String, Object>> monthlyBreakdown;

    // Tables data
    private List<Expense> recentTransactions;
    private List<Expense> pendingApprovalsList;
    private List<Budget> departmentBudgets;

    // Personal / Employee dashboard metrics
    private BigDecimal personalSpentThisMonth = BigDecimal.ZERO;
    private BigDecimal personalPendingAmount = BigDecimal.ZERO;
    private BigDecimal personalApprovedAmount = BigDecimal.ZERO;
    private long personalRejectedCount;

    public DashboardStatsResponse() {}

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public BigDecimal getTotalCompanyExpenses() { return totalCompanyExpenses; }
    public void setTotalCompanyExpenses(BigDecimal totalCompanyExpenses) { this.totalCompanyExpenses = totalCompanyExpenses; }

    public long getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(long pendingApprovals) { this.pendingApprovals = pendingApprovals; }

    public long getApprovedExpenses() { return approvedExpenses; }
    public void setApprovedExpenses(long approvedExpenses) { this.approvedExpenses = approvedExpenses; }

    public long getRejectedExpenses() { return rejectedExpenses; }
    public void setRejectedExpenses(long rejectedExpenses) { this.rejectedExpenses = rejectedExpenses; }

    public BigDecimal getTotalReimbursements() { return totalReimbursements; }
    public void setTotalReimbursements(BigDecimal totalReimbursements) { this.totalReimbursements = totalReimbursements; }

    public BigDecimal getMonthlyCompanyBudget() { return monthlyCompanyBudget; }
    public void setMonthlyCompanyBudget(BigDecimal monthlyCompanyBudget) { this.monthlyCompanyBudget = monthlyCompanyBudget; }

    public double getBudgetUtilization() { return budgetUtilization; }
    public void setBudgetUtilization(double budgetUtilization) { this.budgetUtilization = budgetUtilization; }

    public List<Map<String, Object>> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<Map<String, Object>> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<Map<String, Object>> getDepartmentBreakdown() { return departmentBreakdown; }
    public void setDepartmentBreakdown(List<Map<String, Object>> departmentBreakdown) { this.departmentBreakdown = departmentBreakdown; }

    public List<Map<String, Object>> getMonthlyBreakdown() { return monthlyBreakdown; }
    public void setMonthlyBreakdown(List<Map<String, Object>> monthlyBreakdown) { this.monthlyBreakdown = monthlyBreakdown; }

    public List<Expense> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<Expense> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<Expense> getPendingApprovalsList() { return pendingApprovalsList; }
    public void setPendingApprovalsList(List<Expense> pendingApprovalsList) { this.pendingApprovalsList = pendingApprovalsList; }

    public List<Budget> getDepartmentBudgets() { return departmentBudgets; }
    public void setDepartmentBudgets(List<Budget> departmentBudgets) { this.departmentBudgets = departmentBudgets; }

    public BigDecimal getPersonalSpentThisMonth() { return personalSpentThisMonth; }
    public void setPersonalSpentThisMonth(BigDecimal personalSpentThisMonth) { this.personalSpentThisMonth = personalSpentThisMonth; }

    public BigDecimal getPersonalPendingAmount() { return personalPendingAmount; }
    public void setPersonalPendingAmount(BigDecimal personalPendingAmount) { this.personalPendingAmount = personalPendingAmount; }

    public BigDecimal getPersonalApprovedAmount() { return personalApprovedAmount; }
    public void setPersonalApprovedAmount(BigDecimal personalApprovedAmount) { this.personalApprovedAmount = personalApprovedAmount; }

    public long getPersonalRejectedCount() { return personalRejectedCount; }
    public void setPersonalRejectedCount(long personalRejectedCount) { this.personalRejectedCount = personalRejectedCount; }
}
