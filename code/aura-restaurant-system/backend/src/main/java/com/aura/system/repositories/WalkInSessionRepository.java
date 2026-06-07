package com.aura.system.repositories;

import com.aura.system.entities.WalkInSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalkInSessionRepository extends JpaRepository<WalkInSession, Long> {
}