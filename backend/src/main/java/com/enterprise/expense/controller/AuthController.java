package com.enterprise.expense.controller;

import com.enterprise.expense.config.JwtUtils;
import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.dto.AuthRequest;
import com.enterprise.expense.dto.AuthResponse;
import com.enterprise.expense.dto.RegisterRequest;
import com.enterprise.expense.model.Department;
import com.enterprise.expense.model.Role;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.DepartmentRepository;
import com.enterprise.expense.repository.UserRepository;
import com.enterprise.expense.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId()).orElseThrow();

            AuthResponse response = new AuthResponse(
                    jwt,
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getEmployeeId(),
                    user.getDepartment() != null ? user.getDepartment().getId() : null,
                    user.getDepartment() != null ? user.getDepartment().getName() : "General",
                    user.getAvatarUrl()
            );

            auditService.log(user, "USER_LOGIN", "USER", user.getId(), "User logged in successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email or password", "error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        if (signUpRequest.getEmployeeId() != null && userRepository.existsByEmployeeId(signUpRequest.getEmployeeId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Employee ID already registered!"));
        }

        Department department = null;
        if (signUpRequest.getDepartmentId() != null) {
            department = departmentRepository.findById(signUpRequest.getDepartmentId()).orElse(null);
        }

        Role userRole = signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.ROLE_EMPLOYEE;

        User user = new User(
                signUpRequest.getFullName(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()),
                userRole,
                signUpRequest.getEmployeeId() != null ? signUpRequest.getEmployeeId() : "EMP-" + (System.currentTimeMillis() % 10000),
                department
        );
        user.setPhone(signUpRequest.getPhone());
        User savedUser = userRepository.save(user);

        auditService.log(savedUser, "USER_REGISTER", "USER", savedUser.getId(), "User registered: " + savedUser.getEmail());

        String jwt = jwtUtils.generateTokenFromUsername(savedUser.getEmail());
        AuthResponse response = new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getEmployeeId(),
                savedUser.getDepartment() != null ? savedUser.getDepartment().getId() : null,
                savedUser.getDepartment() != null ? savedUser.getDepartment().getName() : "General",
                savedUser.getAvatarUrl()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        AuthResponse response = new AuthResponse(
                null,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getEmployeeId(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getDepartment() != null ? user.getDepartment().getName() : "General",
                user.getAvatarUrl()
        );
        return ResponseEntity.ok(response);
    }
}
