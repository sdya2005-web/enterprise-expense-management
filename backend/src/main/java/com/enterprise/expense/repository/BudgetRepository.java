package com.enterprise.expense.repository;

import com.enterprise.expense.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByDepartmentIdAndYearAndMonth(Long departmentId, Integer year, Integer month);
    List<Budget> findByYearAndMonth(Integer year, Integer month);
    List<Budget> findByDepartmentId(Long departmentId);
    List<Budget> findByProjectId(Long projectId);

    @Query("SELECT COALESCE(SUM(b.allocatedAmount), 0) FROM Budget b WHERE b.year = :year AND b.month = :month")
    BigDecimal sumAllocatedByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT COALESCE(SUM(b.spentAmount), 0) FROM Budget b WHERE b.year = :year AND b.month = :month")
    BigDecimal sumSpentByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);
}
