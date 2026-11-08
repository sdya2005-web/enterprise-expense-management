package com.enterprise.expense.dto;

import java.math.BigDecimal;

public class BudgetRequest {
    private Long departmentId;
    private Long projectId;
    private Integer year;
    private Integer month;
    private BigDecimal allocatedAmount;
    private Double alertThreshold;

    public BudgetRequest() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }

    public Double getAlertThreshold() { return alertThreshold; }
    public void setAlertThreshold(Double alertThreshold) { this.alertThreshold = alertThreshold; }
}
