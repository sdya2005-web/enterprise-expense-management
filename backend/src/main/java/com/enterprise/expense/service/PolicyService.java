package com.enterprise.expense.service;

import com.enterprise.expense.model.Expense;
import com.enterprise.expense.model.ExpenseCategory;
import com.enterprise.expense.model.ExpensePolicy;
import com.enterprise.expense.repository.ExpensePolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PolicyService {

    @Autowired
    private ExpensePolicyRepository policyRepository;

    public List<ExpensePolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public ExpensePolicy savePolicy(ExpensePolicy policy) {
        return policyRepository.save(policy);
    }

    public List<String> validateExpense(Expense expense, boolean hasReceipt) {
        List<String> violations = new ArrayList<>();
        Optional<ExpensePolicy> policyOpt = policyRepository.findByCategory(expense.getCategory());

        if (policyOpt.isPresent()) {
            ExpensePolicy policy = policyOpt.get();
            if (Boolean.TRUE.equals(policy.getIsActive())) {
                if (policy.getMaxLimit() != null && expense.getAmount().compareTo(policy.getMaxLimit()) > 0) {
                    violations.add("Amount ($" + expense.getAmount() + ") exceeds standard limit of $" + policy.getMaxLimit() + " for category " + expense.getCategory().getDisplayName());
                }
                if (Boolean.TRUE.equals(policy.getReceiptRequired()) && !hasReceipt && expense.getAmount().compareTo(BigDecimal.valueOf(25)) > 0) {
                    violations.add("Receipt upload is mandatory for " + expense.getCategory().getDisplayName() + " expenses exceeding $25");
                }
            }
        } else {
            // General company rule
            if (expense.getAmount().compareTo(BigDecimal.valueOf(5000)) > 0) {
                violations.add("Expenses over $5,000 require senior executive review");
            }
        }

        return violations;
    }
}
