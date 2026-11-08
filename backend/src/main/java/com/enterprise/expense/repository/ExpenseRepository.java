package com.enterprise.expense.repository;

import com.enterprise.expense.model.Expense;
import com.enterprise.expense.model.ExpenseCategory;
import com.enterprise.expense.model.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    Optional<Expense> findByExpenseNumber(String expenseNumber);
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Expense> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    List<Expense> findByStatusOrderByCreatedAtDesc(ExpenseStatus status);
    List<Expense> findByDepartmentIdAndStatusOrderByCreatedAtDesc(Long departmentId, ExpenseStatus status);
    
    long countByStatus(ExpenseStatus status);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumTotalCompanyExpenses();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.status = :status")
    BigDecimal sumAmountByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.department.id = :departmentId")
    BigDecimal sumAmountByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.project.id = :projectId")
    BigDecimal sumAmountByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0), COUNT(e) FROM Expense e GROUP BY e.category")
    List<Object[]> findCategoryBreakdown();

    @Query("SELECT e.department.name, COALESCE(SUM(e.amount), 0), COUNT(e) FROM Expense e GROUP BY e.department.name")
    List<Object[]> findDepartmentBreakdown();

    @Query("SELECT FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate), COALESCE(SUM(e.amount), 0) " +
           "FROM Expense e GROUP BY FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate) " +
           "ORDER BY FUNCTION('YEAR', e.expenseDate) DESC, FUNCTION('MONTH', e.expenseDate) DESC")
    List<Object[]> findMonthlyBreakdown();

    List<Expense> findTop10ByOrderByCreatedAtDesc();
}
