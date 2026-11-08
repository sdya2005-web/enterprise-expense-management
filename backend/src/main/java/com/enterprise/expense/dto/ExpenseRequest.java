package com.enterprise.expense.dto;

import com.enterprise.expense.model.ExpenseCategory;
import com.enterprise.expense.model.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {
    private String title;
    private Long userId; // optional if derived from token
    private String employeeId;
    private Long departmentId;
    private Long projectId;
    private ExpenseCategory category;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String businessPurpose;
    private PaymentMethod paymentMethod;

    public ExpenseRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public String getBusinessPurpose() { return businessPurpose; }
    public void setBusinessPurpose(String businessPurpose) { this.businessPurpose = businessPurpose; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}
