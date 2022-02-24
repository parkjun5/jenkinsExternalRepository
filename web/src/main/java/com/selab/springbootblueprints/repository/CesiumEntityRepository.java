package com.selab.springbootblueprints.repository;

import com.selab.springbootblueprints.model.entity.Cesiumentity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CesiumEntityRepository extends JpaRepository<Cesiumentity, Long> {

}
