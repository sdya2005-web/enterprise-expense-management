package com.enterprise.expense.dto;

import com.enterprise.expense.model.PaymentMethod;
import java.time.LocalDate;

public class ReimbursementRequest {
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private LocalDate paymentDate;
    private String notes;

    public ReimbursementRequest() {}

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
