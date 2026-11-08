package com.enterprise.expense.service;

import com.enterprise.expense.dto.ReimbursementRequest;
import com.enterprise.expense.model.*;
import com.enterprise.expense.repository.ExpenseRepository;
import com.enterprise.expense.repository.ReimbursementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReimbursementService {

    @Autowired
    private ReimbursementRepository reimbursementRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    public List<Reimbursement> getAllReimbursements() {
        return reimbursementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Reimbursement processReimbursement(Long expenseId, ReimbursementRequest request, User financeUser) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + expenseId));

        expense.setStatus(ExpenseStatus.REIMBURSED);
        Expense savedExpense = expenseRepository.save(expense);

        LocalDate pDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        String txRef = request.getTransactionReference() != null && !request.getTransactionReference().trim().isEmpty()
                ? request.getTransactionReference()
                : "TXN-" + System.currentTimeMillis();

        PaymentMethod method = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.DIRECT_DEPOSIT;

        Reimbursement reimbursement = new Reimbursement(
                savedExpense,
                financeUser,
                savedExpense.getAmount(),
                method,
                txRef,
                pDate,
                request.getNotes()
        );

        Reimbursement savedReimbursement = reimbursementRepository.save(reimbursement);

        // Audit Log
        auditService.log(financeUser, "PROCESS_REIMBURSEMENT", "REIMBURSEMENT", savedReimbursement.getId(),
                "Processed reimbursement of $" + savedExpense.getAmount() + " for expense #" + savedExpense.getExpenseNumber() + 
                " via " + method.getDisplayName() + ". Ref: " + txRef);

        // Notify Employee
        notificationService.notifyUser(savedExpense.getUser(), "Reimbursement Processed!",
                "Your expense #" + savedExpense.getExpenseNumber() + " ($" + savedExpense.getAmount() + 
                ") has been reimbursed via " + method.getDisplayName() + ". Ref #" + txRef,
                "SUCCESS", "/reimbursements");

        return savedReimbursement;
    }
}
