package com.enterprise.expense.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    @Column(name = "approver_role", nullable = false, length = 50)
    private String approverRole;

    @Column(nullable = false, length = 30)
    private String status; // APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "decision_date", nullable = false)
    private LocalDateTime decisionDate = LocalDateTime.now();

    public Approval() {}

    public Approval(Expense expense, User approver, String approverRole, String status, String comments) {
        this.expense = expense;
        this.approver = approver;
        this.approverRole = approverRole;
        this.status = status;
        this.comments = comments;
        this.decisionDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Expense getExpense() { return expense; }
    public void setExpense(Expense expense) { this.expense = expense; }

    public User getApprover() { return approver; }
    public void setApprover(User approver) { this.approver = approver; }

    public String getApproverRole() { return approverRole; }
    public void setApproverRole(String approverRole) { this.approverRole = approverRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getDecisionDate() { return decisionDate; }
    public void setDecisionDate(LocalDateTime decisionDate) { this.decisionDate = decisionDate; }
}
