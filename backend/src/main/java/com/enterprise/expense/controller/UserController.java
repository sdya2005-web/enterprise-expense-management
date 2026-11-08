package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.dto.RegisterRequest;
import com.enterprise.expense.model.Department;
import com.enterprise.expense.model.Role;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.DepartmentRepository;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody RegisterRequest request, Authentication auth) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use!"));
        }

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE,
                request.getEmployeeId(),
                dept
        );
        user.setPhone(request.getPhone());
        User saved = userRepository.save(user);

        User current = getCurrentUser(auth);
        auditService.log(current, "CREATE_USER", "USER", saved.getId(), "Created user: " + saved.getEmail() + " (" + saved.getRole() + ")");

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody RegisterRequest request, Authentication auth) {
        return userRepository.findById(id).map(user -> {
            user.setFullName(request.getFullName());
            if (request.getRole() != null) user.setRole(request.getRole());
            if (request.getEmployeeId() != null) user.setEmployeeId(request.getEmployeeId());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            if (request.getDepartmentId() != null) {
                departmentRepository.findById(request.getDepartmentId()).ifPresent(user::setDepartment);
            }
            User updated = userRepository.save(user);

            User current = getCurrentUser(auth);
            auditService.log(current, "UPDATE_USER", "USER", updated.getId(), "Updated user details for: " + updated.getEmail());

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        return userRepository.findById(id).map(user -> {
            // Soft deactivate or delete
            user.setActive(false);
            userRepository.save(user);

            User current = getCurrentUser(auth);
            auditService.log(current, "DELETE_USER", "USER", id, "Deactivated user: " + user.getEmail());

            return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
