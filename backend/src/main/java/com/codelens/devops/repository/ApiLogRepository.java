package com.codelens.devops.repository;

import com.codelens.devops.entity.ApiLog;
import com.codelens.devops.entity.MonitoredApi;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApiLogRepository extends JpaRepository<ApiLog, Long> {
    List<ApiLog> findByApiOrderByCheckedAtDesc(MonitoredApi api, Pageable pageable);
    
    @Query("SELECT AVG(l.responseTimeMs) FROM ApiLog l WHERE l.api.id = :apiId AND l.checkedAt > :since")
    Double getAverageResponseTime(@Param("apiId") Long apiId, @Param("since") LocalDateTime since);
    
    List<ApiLog> findByApiAndCheckedAtAfterOrderByCheckedAtDesc(MonitoredApi api, LocalDateTime since);
}
