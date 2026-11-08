package com.enterprise.expense.repository;

import com.enterprise.expense.model.Role;
import com.enterprise.expense.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByEmployeeId(String employeeId);
    List<User> findByRole(Role role);
    List<User> findByDepartmentId(Long departmentId);
    long countByActiveTrue();
}
