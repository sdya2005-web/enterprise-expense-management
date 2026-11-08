package com.enterprise.expense.dto;

public class ApprovalRequest {
    private String status; // APPROVED or REJECTED
    private String comments;

    public ApprovalRequest() {}

    public ApprovalRequest(String status, String comments) {
        this.status = status;
        this.comments = comments;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
