package com.enterprise.expense.service;

import com.enterprise.expense.dto.ApprovalRequest;
import com.enterprise.expense.dto.ExpenseRequest;
import com.enterprise.expense.model.*;
import com.enterprise.expense.repository.*;
import com.enterprise.expense.util.FileHashUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseReceiptRepository receiptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ApprovalRepository approvalRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PolicyService policyService;

    @Autowired
    private BudgetService budgetService;

    @Value("${app.upload.dir:./uploads/receipts}")
    private String uploadDir;

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<Expense> getExpensesByUser(Long userId) {
        return expenseRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Expense> getExpensesByDepartment(Long departmentId) {
        return expenseRepository.findByDepartmentIdOrderByCreatedAtDesc(departmentId);
    }

    public List<Expense> getPendingApprovalsForUser(User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            return expenseRepository.findByStatusOrderByCreatedAtDesc(ExpenseStatus.PENDING_APPROVAL);
        } else if (user.getRole() == Role.ROLE_MANAGER) {
            if (user.getDepartment() != null) {
                return expenseRepository.findByDepartmentIdAndStatusOrderByCreatedAtDesc(
                        user.getDepartment().getId(), ExpenseStatus.PENDING_APPROVAL);
            }
        }
        return Collections.emptyList();
    }

    public List<Expense> getApprovedForFinance() {
        List<Expense> list = new ArrayList<>();
        list.addAll(expenseRepository.findByStatusOrderByCreatedAtDesc(ExpenseStatus.APPROVED));
        list.addAll(expenseRepository.findByStatusOrderByCreatedAtDesc(ExpenseStatus.FINANCE_VERIFICATION));
        list.addAll(expenseRepository.findByStatusOrderByCreatedAtDesc(ExpenseStatus.PAYMENT_PROCESSING));
        return list;
    }

    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    @Transactional
    public Expense createExpense(ExpenseRequest request, MultipartFile receiptFile, User currentUser) throws IOException {
        User expenseUser = currentUser;
        if (request.getUserId() != null && (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_MANAGER)) {
            expenseUser = userRepository.findById(request.getUserId()).orElse(currentUser);
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(expenseUser.getDepartment());
        } else {
            department = expenseUser.getDepartment();
        }

        if (department == null) {
            // fallback to first department
            department = departmentRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No department found. Please create a department first."));
        }

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        Expense expense = new Expense();
        String generatedNum = "EXP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + "-" + (new Random().nextInt(900) + 100);
        expense.setExpenseNumber(generatedNum);
        expense.setUser(expenseUser);
        expense.setDepartment(department);
        expense.setProject(project);
        expense.setTitle(request.getTitle());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setBusinessPurpose(request.getBusinessPurpose());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setStatus(ExpenseStatus.PENDING_APPROVAL);

        boolean hasReceipt = (receiptFile != null && !receiptFile.isEmpty());

        // Validate policy rules
        List<String> violations = policyService.validateExpense(expense, hasReceipt);
        if (!violations.isEmpty()) {
            expense.setPolicyViolations(String.join("; ", violations));
        }

        Expense savedExpense = expenseRepository.save(expense);

        // Process Receipt Upload & Duplicate Detection
        if (hasReceipt) {
            // Calculate SHA-256 hash
            String fileHash;
            try (InputStream is = receiptFile.getInputStream()) {
                fileHash = FileHashUtil.calculateSHA256(is);
            }

            // Duplicate receipt detection
            Optional<ExpenseReceipt> duplicateReceiptOpt = receiptRepository.findByFileHash(fileHash);
            if (duplicateReceiptOpt.isPresent()) {
                Expense prevExpense = duplicateReceiptOpt.get().getExpense();
                String prevNum = prevExpense != null ? prevExpense.getExpenseNumber() : "Unknown";
                throw new IllegalArgumentException("DUPLICATE RECEIPT DETECTED: This exact receipt file was already submitted for Expense #" + prevNum + ". Potential duplicate claim!");
            }

            // Save file to disk
            File uploadDirFolder = new File(uploadDir);
            if (!uploadDirFolder.exists()) {
                uploadDirFolder.mkdirs();
            }

            String originalName = receiptFile.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String storedFileName = UUID.randomUUID() + extension;
            Path targetLocation = Paths.get(uploadDir).resolve(storedFileName);
            Files.copy(receiptFile.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + storedFileName;
            ExpenseReceipt receipt = new ExpenseReceipt(
                    storedFileName,
                    originalName,
                    fileUrl,
                    receiptFile.getContentType(),
                    receiptFile.getSize(),
                    fileHash
            );
            savedExpense.addReceipt(receipt);
            expenseRepository.save(savedExpense);
        }

        // Audit Log
        auditService.log(currentUser, "CREATE_EXPENSE", "EXPENSE", savedExpense.getId(), 
                "Created expense #" + savedExpense.getExpenseNumber() + " for $" + savedExpense.getAmount() + " (" + savedExpense.getTitle() + ")");

        // Notify Managers
        List<User> managers = userRepository.findByRole(Role.ROLE_MANAGER);
        for (User manager : managers) {
            if (manager.getDepartment() != null && manager.getDepartment().getId().equals(department.getId())) {
                notificationService.notifyUser(manager, "New Expense Submission", 
                        expenseUser.getFullName() + " submitted expense #" + savedExpense.getExpenseNumber() + " for $" + savedExpense.getAmount(), 
                        "INFO", "/approvals");
            }
        }

        // Notify Admins
        List<User> admins = userRepository.findByRole(Role.ROLE_ADMIN);
        for (User admin : admins) {
            notificationService.notifyUser(admin, "New Expense Submission", 
                    expenseUser.getFullName() + " submitted expense #" + savedExpense.getExpenseNumber() + " ($" + savedExpense.getAmount() + ")", 
                    "INFO", "/expenses");
        }

        return savedExpense;
    }

    @Transactional
    public Expense approveExpense(Long expenseId, ApprovalRequest request, User approver) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + expenseId));

        if (expense.getStatus() == ExpenseStatus.REJECTED || expense.getStatus() == ExpenseStatus.REIMBURSED) {
            throw new IllegalStateException("Expense cannot be approved from current status: " + expense.getStatus());
        }

        expense.setStatus(ExpenseStatus.FINANCE_VERIFICATION);
        expense.setRejectionReason(null);
        Expense saved = expenseRepository.save(expense);

        Approval approval = new Approval(saved, approver, approver.getRole().name(), "APPROVED", request != null ? request.getComments() : "Approved");
        approvalRepository.save(approval);

        // Update department and project budget spent amounts
        budgetService.recordExpenseAgainstBudget(
                saved.getDepartment().getId(), 
                saved.getProject() != null ? saved.getProject().getId() : null, 
                saved.getAmount()
        );

        // Audit Log
        auditService.log(approver, "APPROVE_EXPENSE", "EXPENSE", saved.getId(), 
                "Approved expense #" + saved.getExpenseNumber() + " by " + approver.getFullName() + ". Comments: " + (request != null ? request.getComments() : ""));

        // Notify Employee
        notificationService.notifyUser(saved.getUser(), "Expense Approved!", 
                "Your expense #" + saved.getExpenseNumber() + " ($" + saved.getAmount() + ") was approved by " + approver.getFullName() + " and forwarded to Finance.", 
                "SUCCESS", "/expenses");

        // Notify Finance Team
        List<User> financeUsers = userRepository.findByRole(Role.ROLE_FINANCE);
        for (User finance : financeUsers) {
            notificationService.notifyUser(finance, "Expense Ready for Reimbursement", 
                    "Approved expense #" + saved.getExpenseNumber() + " ($" + saved.getAmount() + ") is ready for verification.", 
                    "INFO", "/reimbursements");
        }

        return saved;
    }

    @Transactional
    public Expense rejectExpense(Long expenseId, ApprovalRequest request, User approver) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + expenseId));

        String reason = (request != null && request.getComments() != null && !request.getComments().trim().isEmpty())
                ? request.getComments()
                : "Rejected by " + approver.getFullName();

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setRejectionReason(reason);
        Expense saved = expenseRepository.save(expense);

        Approval approval = new Approval(saved, approver, approver.getRole().name(), "REJECTED", reason);
        approvalRepository.save(approval);

        // Audit Log
        auditService.log(approver, "REJECT_EXPENSE", "EXPENSE", saved.getId(), 
                "Rejected expense #" + saved.getExpenseNumber() + " by " + approver.getFullName() + ". Reason: " + reason);

        // Notify Employee
        notificationService.notifyUser(saved.getUser(), "Expense Rejected", 
                "Your expense #" + saved.getExpenseNumber() + " was rejected. Reason: " + reason, 
                "DANGER", "/expenses");

        return saved;
    }
}
