package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.model.Department;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.DepartmentRepository;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDepartment(@RequestBody Department dept, Authentication auth) {
        if (departmentRepository.existsByName(dept.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Department name already exists"));
        }
        if (departmentRepository.existsByCode(dept.getCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Department code already exists"));
        }

        Department saved = departmentRepository.save(dept);
        User current = getCurrentUser(auth);
        auditService.log(current, "CREATE_DEPARTMENT", "DEPARTMENT", saved.getId(), "Created department: " + saved.getName());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department dept, Authentication auth) {
        return departmentRepository.findById(id).map(existing -> {
            existing.setName(dept.getName());
            existing.setCode(dept.getCode());
            existing.setDescription(dept.getDescription());
            existing.setMonthlyBudget(dept.getMonthlyBudget());
            existing.setHeadUserId(dept.getHeadUserId());
            existing.setHeadName(dept.getHeadName());
            Department updated = departmentRepository.save(existing);

            User current = getCurrentUser(auth);
            auditService.log(current, "UPDATE_DEPARTMENT", "DEPARTMENT", updated.getId(), "Updated department: " + updated.getName());

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id, Authentication auth) {
        return departmentRepository.findById(id).map(d -> {
            departmentRepository.delete(d);
            User current = getCurrentUser(auth);
            auditService.log(current, "DELETE_DEPARTMENT", "DEPARTMENT", id, "Deleted department: " + d.getName());
            return ResponseEntity.ok(Map.of("message", "Department deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
