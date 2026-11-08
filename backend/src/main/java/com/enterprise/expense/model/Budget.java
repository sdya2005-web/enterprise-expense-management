package com.enterprise.expense.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "budgets")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month; // 1 to 12

    @Column(name = "allocated_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal allocatedAmount = BigDecimal.ZERO;

    @Column(name = "spent_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(name = "alert_threshold", nullable = false)
    private Double alertThreshold = 80.0; // 80%

    public Budget() {}

    public Budget(Department department, Project project, Integer year, Integer month, BigDecimal allocatedAmount) {
        this.department = department;
        this.project = project;
        this.year = year;
        this.month = month;
        this.allocatedAmount = allocatedAmount;
        this.spentAmount = BigDecimal.ZERO;
        this.remainingAmount = allocatedAmount;
        this.alertThreshold = 80.0;
    }

    public void recalculate() {
        if (allocatedAmount == null) allocatedAmount = BigDecimal.ZERO;
        if (spentAmount == null) spentAmount = BigDecimal.ZERO;
        this.remainingAmount = allocatedAmount.subtract(spentAmount);
    }

    public double getUtilizationPercentage() {
        if (allocatedAmount == null || allocatedAmount.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return spentAmount.multiply(BigDecimal.valueOf(100))
                .divide(allocatedAmount, 2, RoundingMode.HALF_UP).doubleValue();
    }

    public boolean isExceeded() {
        return spentAmount.compareTo(allocatedAmount) > 0;
    }

    public boolean isThresholdReached() {
        return getUtilizationPercentage() >= alertThreshold;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { 
        this.allocatedAmount = allocatedAmount;
        recalculate();
    }

    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { 
        this.spentAmount = spentAmount;
        recalculate();
    }

    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }

    public Double getAlertThreshold() { return alertThreshold; }
    public void setAlertThreshold(Double alertThreshold) { this.alertThreshold = alertThreshold; }
}
