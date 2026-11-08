package com.enterprise.expense.repository;

import com.enterprise.expense.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByDepartmentId(Long departmentId);
    List<Project> findByStatus(String status);
    Optional<Project> findByCode(String code);
    Boolean existsByCode(String code);
}
