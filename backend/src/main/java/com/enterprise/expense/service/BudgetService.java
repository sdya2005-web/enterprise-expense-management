package com.enterprise.expense.service;

import com.enterprise.expense.dto.BudgetRequest;
import com.enterprise.expense.model.Budget;
import com.enterprise.expense.model.Department;
import com.enterprise.expense.model.Project;
import com.enterprise.expense.repository.BudgetRepository;
import com.enterprise.expense.repository.DepartmentRepository;
import com.enterprise.expense.repository.ExpenseRepository;
import com.enterprise.expense.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public List<Budget> getBudgetsByYearAndMonth(Integer year, Integer month) {
        return budgetRepository.findByYearAndMonth(year, month);
    }

    public List<Budget> getBudgetsByDepartment(Long departmentId) {
        return budgetRepository.findByDepartmentId(departmentId);
    }

    @Transactional
    public Budget setBudget(BudgetRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + request.getDepartmentId()));

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        int year = request.getYear() != null ? request.getYear() : LocalDate.now().getYear();
        int month = request.getMonth() != null ? request.getMonth() : LocalDate.now().getMonthValue();

        Optional<Budget> existingOpt = budgetRepository.findByDepartmentIdAndYearAndMonth(department.getId(), year, month);
        Budget budget;
        if (existingOpt.isPresent()) {
            budget = existingOpt.get();
            budget.setAllocatedAmount(request.getAllocatedAmount());
            if (request.getAlertThreshold() != null) {
                budget.setAlertThreshold(request.getAlertThreshold());
            }
        } else {
            budget = new Budget(department, project, year, month, request.getAllocatedAmount());
            if (request.getAlertThreshold() != null) {
                budget.setAlertThreshold(request.getAlertThreshold());
            }
        }

        budget.recalculate();
        return budgetRepository.save(budget);
    }

    @Transactional
    public void recordExpenseAgainstBudget(Long departmentId, Long projectId, BigDecimal amount) {
        int year = LocalDate.now().getYear();
        int month = LocalDate.now().getMonthValue();

        // Update department monthly budget
        Optional<Budget> budgetOpt = budgetRepository.findByDepartmentIdAndYearAndMonth(departmentId, year, month);
        if (budgetOpt.isPresent()) {
            Budget b = budgetOpt.get();
            b.setSpentAmount(b.getSpentAmount().add(amount));
            b.recalculate();
            budgetRepository.save(b);
        }

        // Update project spent amount if project specified
        if (projectId != null) {
            projectRepository.findById(projectId).ifPresent(p -> {
                p.setSpentAmount(p.getSpentAmount().add(amount));
                projectRepository.save(p);
            });
        }
    }
}
