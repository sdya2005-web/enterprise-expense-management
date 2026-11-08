package com.enterprise.expense.controller;

import com.enterprise.expense.config.UserDetailsImpl;
import com.enterprise.expense.model.Department;
import com.enterprise.expense.model.Project;
import com.enterprise.expense.model.User;
import com.enterprise.expense.repository.DepartmentRepository;
import com.enterprise.expense.repository.ProjectRepository;
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
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

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
    public ResponseEntity<List<Project>> getAllProjects(@RequestParam(value = "departmentId", required = false) Long departmentId) {
        if (departmentId != null) {
            return ResponseEntity.ok(projectRepository.findByDepartmentId(departmentId));
        }
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> body, Authentication auth) {
        String name = (String) body.get("name");
        String code = (String) body.get("code");
        String description = (String) body.get("description");
        Long departmentId = Long.valueOf(body.get("departmentId").toString());
        java.math.BigDecimal budget = new java.math.BigDecimal(body.getOrDefault("allocatedBudget", "0").toString());

        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Project project = new Project(name, code, dept, budget, description);
        Project saved = projectRepository.save(project);

        User current = getCurrentUser(auth);
        auditService.log(current, "CREATE_PROJECT", "PROJECT", saved.getId(), "Created project: " + saved.getName());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        return projectRepository.findById(id).map(existing -> {
            if (body.containsKey("name")) existing.setName((String) body.get("name"));
            if (body.containsKey("code")) existing.setCode((String) body.get("code"));
            if (body.containsKey("description")) existing.setDescription((String) body.get("description"));
            if (body.containsKey("status")) existing.setStatus((String) body.get("status"));
            if (body.containsKey("allocatedBudget")) {
                existing.setAllocatedBudget(new java.math.BigDecimal(body.get("allocatedBudget").toString()));
            }
            if (body.containsKey("departmentId")) {
                departmentRepository.findById(Long.valueOf(body.get("departmentId").toString())).ifPresent(existing::setDepartment);
            }
            Project updated = projectRepository.save(existing);

            User current = getCurrentUser(auth);
            auditService.log(current, "UPDATE_PROJECT", "PROJECT", updated.getId(), "Updated project: " + updated.getName());

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication auth) {
        return projectRepository.findById(id).map(p -> {
            projectRepository.delete(p);
            User current = getCurrentUser(auth);
            auditService.log(current, "DELETE_PROJECT", "PROJECT", id, "Deleted project: " + p.getName());
            return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
