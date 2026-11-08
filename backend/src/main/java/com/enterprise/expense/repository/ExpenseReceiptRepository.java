package com.enterprise.expense.repository;

import com.enterprise.expense.model.ExpenseReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseReceiptRepository extends JpaRepository<ExpenseReceipt, Long> {
    Optional<ExpenseReceipt> findByFileHash(String fileHash);
    Boolean existsByFileHash(String fileHash);
    List<ExpenseReceipt> findByExpenseId(Long expenseId);
}
