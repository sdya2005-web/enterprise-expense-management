package com.enterprise.expense.repository;

import com.enterprise.expense.model.Reimbursement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReimbursementRepository extends JpaRepository<Reimbursement, Long> {
    Optional<Reimbursement> findByExpenseId(Long expenseId);
    List<Reimbursement> findByStatusOrderByCreatedAtDesc(String status);
    List<Reimbursement> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Reimbursement r WHERE r.status = 'REIMBURSED'")
    BigDecimal sumTotalReimbursed();
}
