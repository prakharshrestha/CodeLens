package com.codelens.devops.repository;

import com.codelens.devops.entity.MonitoredApi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonitoredApiRepository extends JpaRepository<MonitoredApi, Long> {
    List<MonitoredApi> findByActiveTrue();
    long countByStatus(MonitoredApi.Status status);
    long countByActiveTrue();
}
