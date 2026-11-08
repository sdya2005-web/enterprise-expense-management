package com.enterprise.expense.repository;

import com.enterprise.expense.model.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByExpenseIdOrderByDecisionDateDesc(Long expenseId);
    List<Approval> findByApproverIdOrderByDecisionDateDesc(Long approverId);
}
