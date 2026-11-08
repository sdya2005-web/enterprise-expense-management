package com.enterprise.expense.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "expense_policies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ExpensePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 50)
    private ExpenseCategory category;

    @Column(name = "max_limit", precision = 12, scale = 2, nullable = false)
    private BigDecimal maxLimit;

    @Column(name = "receipt_required", nullable = false)
    private Boolean receiptRequired = true;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public ExpensePolicy() {}

    public ExpensePolicy(ExpenseCategory category, BigDecimal maxLimit, Boolean receiptRequired, String description) {
        this.category = category;
        this.maxLimit = maxLimit;
        this.receiptRequired = receiptRequired;
        this.description = description;
        this.isActive = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }

    public BigDecimal getMaxLimit() { return maxLimit; }
    public void setMaxLimit(BigDecimal maxLimit) { this.maxLimit = maxLimit; }

    public Boolean getReceiptRequired() { return receiptRequired; }
    public void setReceiptRequired(Boolean receiptRequired) { this.receiptRequired = receiptRequired; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
