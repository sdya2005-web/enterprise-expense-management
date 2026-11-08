package com.enterprise.expense.repository;

import com.enterprise.expense.model.ExpenseCategory;
import com.enterprise.expense.model.ExpensePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpensePolicyRepository extends JpaRepository<ExpensePolicy, Long> {
    Optional<ExpensePolicy> findByCategory(ExpenseCategory category);
}
