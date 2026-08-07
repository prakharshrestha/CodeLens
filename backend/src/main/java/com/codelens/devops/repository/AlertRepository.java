package com.codelens.devops.repository;

import com.codelens.devops.entity.Alert;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByOrderByCreatedAtDesc(Pageable pageable);
    List<Alert> findByReadFalseOrderByCreatedAtDesc();
    long countByReadFalse();
}
