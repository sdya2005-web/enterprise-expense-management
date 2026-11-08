package com.enterprise.expense.service;

import com.enterprise.expense.model.*;
import com.enterprise.expense.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DataInitializationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ExpensePolicyRepository policyRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ApprovalRepository approvalRepository;

    @Autowired
    private ReimbursementRepository reimbursementRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        logger.info("Checking database seed status...");

        // 1. Departments
        if (departmentRepository.count() == 0) {
            Department eng = departmentRepository.save(new Department("Engineering", "ENG", "Core Software Engineering & Tech Operations", BigDecimal.valueOf(50000.00)));
            Department mkt = departmentRepository.save(new Department("Sales & Marketing", "MKT", "Global Marketing, Branding & Enterprise Sales", BigDecimal.valueOf(40000.00)));
            Department prd = departmentRepository.save(new Department("Product & Design", "PRD", "Product Strategy, UX/UI, and Design Systems", BigDecimal.valueOf(25000.00)));
            Department fin = departmentRepository.save(new Department("Finance & Legal", "FIN", "Corporate Finance, Accounting, Compliance & Payroll", BigDecimal.valueOf(15000.00)));
            Department hr  = departmentRepository.save(new Department("Human Resources", "HR", "Talent Acquisition, People Operations & Culture", BigDecimal.valueOf(12000.00)));

            logger.info("Default departments created.");

            // 2. Projects
            projectRepository.save(new Project("Cloud Infrastructure Modernization", "PRJ-CLOUD", eng, BigDecimal.valueOf(25000.00), "Migration to Multi-Cloud Architecture"));
            projectRepository.save(new Project("Enterprise Mobile App v3.0", "PRJ-MOB", prd, BigDecimal.valueOf(15000.00), "Next-gen iOS & Android apps"));
            projectRepository.save(new Project("Global Brand Campaign 2026", "PRJ-MKT-26", mkt, BigDecimal.valueOf(20000.00), "Brand awareness & Enterprise lead gen"));
            projectRepository.save(new Project("Automated Financial Auditing", "PRJ-FIN-AI", fin, BigDecimal.valueOf(8000.00), "Real-time ledger reconciliation"));
        }

        // 3. Users (Admin Divi, Manager, Finance, Employee)
        if (userRepository.count() == 0) {
            Department eng = departmentRepository.findByCode("ENG").orElse(null);
            Department fin = departmentRepository.findByCode("FIN").orElse(null);

            // Admin Divi
            User admin = new User();
            admin.setFullName("Divi");
            admin.setEmail("admin@enterprise.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setEmployeeId("EMP-001");
            admin.setPhone("+1 (555) 019-2834");
            admin.setDepartment(fin);
            admin.setActive(true);
            admin = userRepository.save(admin);

            // Manager Sarah
            User manager = new User();
            manager.setFullName("Sarah Jenkins");
            manager.setEmail("manager@enterprise.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setRole(Role.ROLE_MANAGER);
            manager.setEmployeeId("EMP-042");
            manager.setPhone("+1 (555) 024-5821");
            manager.setDepartment(eng);
            manager.setActive(true);
            manager = userRepository.save(manager);
            if (eng != null) {
                eng.setHeadUserId(manager.getId());
                eng.setHeadName(manager.getFullName());
                departmentRepository.save(eng);
            }

            // Finance Mark
            User finance = new User();
            finance.setFullName("Mark Vance");
            finance.setEmail("finance@enterprise.com");
            finance.setPassword(passwordEncoder.encode("finance123"));
            finance.setRole(Role.ROLE_FINANCE);
            finance.setEmployeeId("EMP-015");
            finance.setPhone("+1 (555) 088-3490");
            finance.setDepartment(fin);
            finance.setActive(true);
            finance = userRepository.save(finance);

            // Employee Alex
            User employee = new User();
            employee.setFullName("Alex Rivera");
            employee.setEmail("employee@enterprise.com");
            employee.setPassword(passwordEncoder.encode("employee123"));
            employee.setRole(Role.ROLE_EMPLOYEE);
            employee.setEmployeeId("EMP-108");
            employee.setPhone("+1 (555) 073-9912");
            employee.setDepartment(eng);
            employee.setActive(true);
            employee = userRepository.save(employee);

            // Employee Jessica
            User employee2 = new User();
            employee2.setFullName("Jessica Taylor");
            employee2.setEmail("jessica@enterprise.com");
            employee2.setPassword(passwordEncoder.encode("employee123"));
            employee2.setRole(Role.ROLE_EMPLOYEE);
            employee2.setEmployeeId("EMP-109");
            employee2.setPhone("+1 (555) 073-9913");
            employee2.setDepartment(eng);
            employee2.setActive(true);
            employee2 = userRepository.save(employee2);

            logger.info("Standard users created: Admin Divi, Manager Sarah, Finance Mark, Employee Alex, Employee Jessica.");
        }

        // 4. Expense Policies
        if (policyRepository.count() == 0) {
            policyRepository.save(new ExpensePolicy(ExpenseCategory.TRAVEL, BigDecimal.valueOf(1500.00), true, "Flight & long-distance transit. Economy class required."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.FOOD, BigDecimal.valueOf(150.00), true, "Daily meal limit during business travel. Itemized bill required."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.ACCOMMODATION, BigDecimal.valueOf(800.00), true, "Hotel standard room rate max per night."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.TRANSPORTATION, BigDecimal.valueOf(200.00), true, "Local taxi, Uber, train or car rental."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.OFFICE_SUPPLIES, BigDecimal.valueOf(500.00), true, "Workstation accessories, monitors, cables, stationery."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.CLIENT_MEETINGS, BigDecimal.valueOf(600.00), true, "Client entertainment, lunches, meetings. Attendee list required."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.INTERNET_AND_COMMUNICATION, BigDecimal.valueOf(100.00), true, "Monthly home broadband & mobile reimbursement."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.MEDICAL, BigDecimal.valueOf(1000.00), true, "Emergency on-trip healthcare or work-related physical assessment."));
            policyRepository.save(new ExpensePolicy(ExpenseCategory.OTHER, BigDecimal.valueOf(300.00), true, "Miscellaneous operational expenses with approval note."));
            logger.info("Standard expense policies initialized.");
        }

        // 5. Budgets for current month & year
        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        if (budgetRepository.count() == 0) {
            for (Department d : departmentRepository.findAll()) {
                Budget b = new Budget(d, null, currentYear, currentMonth, d.getMonthlyBudget());
                budgetRepository.save(b);
            }
            logger.info("Department monthly budgets initialized.");
        }

        // 6. Sample Expenses with workflow states
        if (expenseRepository.count() == 0) {
            User alex = userRepository.findByEmail("employee@enterprise.com").orElse(null);
            User jessica = userRepository.findByEmail("jessica@enterprise.com").orElse(null);
            User manager = userRepository.findByEmail("manager@enterprise.com").orElse(null);
            User finance = userRepository.findByEmail("finance@enterprise.com").orElse(null);
            Department eng = departmentRepository.findByCode("ENG").orElse(null);
            Project cloudPrj = projectRepository.findByCode("PRJ-CLOUD").orElse(null);

            if (alex != null && eng != null) {
                // 1. Pending Approval expense
                Expense exp1 = new Expense();
                exp1.setExpenseNumber("EXP-2026-001");
                exp1.setUser(alex);
                exp1.setDepartment(eng);
                exp1.setProject(cloudPrj);
                exp1.setTitle("AWS Cloud Architect Summit Flight & Entry");
                exp1.setCategory(ExpenseCategory.TRAVEL);
                exp1.setAmount(BigDecimal.valueOf(850.00));
                exp1.setExpenseDate(LocalDate.now().minusDays(3));
                exp1.setBusinessPurpose("Attended annual cloud architecture conference in San Francisco for infrastructure upgrades.");
                exp1.setPaymentMethod(PaymentMethod.CORPORATE_CARD);
                exp1.setStatus(ExpenseStatus.PENDING_APPROVAL);
                exp1 = expenseRepository.save(exp1);

                // 2. Approved / Finance verification expense
                Expense exp2 = new Expense();
                exp2.setExpenseNumber("EXP-2026-002");
                exp2.setUser(alex);
                exp2.setDepartment(eng);
                exp2.setProject(cloudPrj);
                exp2.setTitle("Datacenter High-Speed Ethernet Cables & Switches");
                exp2.setCategory(ExpenseCategory.OFFICE_SUPPLIES);
                exp2.setAmount(BigDecimal.valueOf(420.50));
                exp2.setExpenseDate(LocalDate.now().minusDays(7));
                exp2.setBusinessPurpose("Emergency rack cabling for primary staging cluster servers.");
                exp2.setPaymentMethod(PaymentMethod.PERSONAL_CREDIT_CARD);
                exp2.setStatus(ExpenseStatus.FINANCE_VERIFICATION);
                exp2 = expenseRepository.save(exp2);

                if (manager != null) {
                    approvalRepository.save(new Approval(exp2, manager, "ROLE_MANAGER", "APPROVED", "Approved. Essential server hardware components."));
                }

                // 3. Reimbursed expense
                Expense exp3 = new Expense();
                exp3.setExpenseNumber("EXP-2026-003");
                exp3.setUser(alex);
                exp3.setDepartment(eng);
                exp3.setProject(cloudPrj);
                exp3.setTitle("Client Dinner & Technical Strategy Session");
                exp3.setCategory(ExpenseCategory.CLIENT_MEETINGS);
                exp3.setAmount(BigDecimal.valueOf(340.00));
                exp3.setExpenseDate(LocalDate.now().minusDays(15));
                exp3.setBusinessPurpose("Met with Enterprise partner CTO to finalize cloud rollout specs.");
                exp3.setPaymentMethod(PaymentMethod.PERSONAL_CREDIT_CARD);
                exp3.setStatus(ExpenseStatus.REIMBURSED);
                exp3 = expenseRepository.save(exp3);

                if (manager != null) {
                    approvalRepository.save(new Approval(exp3, manager, "ROLE_MANAGER", "APPROVED", "Approved for client liaison meeting."));
                }
                if (finance != null) {
                    reimbursementRepository.save(new Reimbursement(
                            exp3, finance, exp3.getAmount(), PaymentMethod.DIRECT_DEPOSIT, 
                            "ACH-99482104", LocalDate.now().minusDays(10), "Direct deposit sent to employee payroll account"));
                }

                // 4. Rejected expense
                Expense exp4 = new Expense();
                exp4.setExpenseNumber("EXP-2026-004");
                exp4.setUser(jessica != null ? jessica : alex);
                exp4.setDepartment(eng);
                exp4.setTitle("Personal Luxury Headphones");
                exp4.setCategory(ExpenseCategory.OTHER);
                exp4.setAmount(BigDecimal.valueOf(550.00));
                exp4.setExpenseDate(LocalDate.now().minusDays(5));
                exp4.setBusinessPurpose("Noise cancelling headphones for home desk.");
                exp4.setPaymentMethod(PaymentMethod.PERSONAL_CREDIT_CARD);
                exp4.setStatus(ExpenseStatus.REJECTED);
                exp4.setRejectionReason("Personal audio hardware exceeds peripheral allowance ($150 limit). Please order via company standard catalog.");
                exp4 = expenseRepository.save(exp4);

                if (manager != null) {
                    approvalRepository.save(new Approval(exp4, manager, "ROLE_MANAGER", "REJECTED", exp4.getRejectionReason()));
                }

                // Update budget spent amount for approved expenses
                budgetRepository.findByDepartmentIdAndYearAndMonth(eng.getId(), currentYear, currentMonth).ifPresent(b -> {
                    b.setSpentAmount(BigDecimal.valueOf(760.50));
                    b.recalculate();
                    budgetRepository.save(b);
                });
            }

            logger.info("Sample expenses, approvals, and reimbursements seeded successfully.");
        }

        // 7. Sample Audit Logs
        if (auditLogRepository.count() == 0) {
            User admin = userRepository.findByEmail("admin@enterprise.com").orElse(null);
            auditLogRepository.save(new AuditLog(admin, "Divi (admin@enterprise.com)", "SYSTEM_STARTUP", "SYSTEM", 1L, "Enterprise Expense Management System initialized.", "127.0.0.1"));
            auditLogRepository.save(new AuditLog(admin, "Divi (admin@enterprise.com)", "UPDATE_POLICY", "POLICY", 1L, "Configured default travel and meal limits.", "127.0.0.1"));
        }

        // 8. Sample Notifications
        if (notificationRepository.count() == 0) {
            User alex = userRepository.findByEmail("employee@enterprise.com").orElse(null);
            User manager = userRepository.findByEmail("manager@enterprise.com").orElse(null);
            if (alex != null) {
                notificationRepository.save(new Notification(alex, "Welcome to Enterprise Expense System", "You can now submit expenses, upload receipts, and track approvals.", "INFO", "/dashboard"));
            }
            if (manager != null) {
                notificationRepository.save(new Notification(manager, "Pending Approvals Waiting", "You have 1 pending expense approval request from your team.", "WARNING", "/approvals"));
            }
        }

        logger.info("Database initialization completed successfully.");
    }
}
