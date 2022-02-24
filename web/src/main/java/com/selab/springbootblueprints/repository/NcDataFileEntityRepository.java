package com.selab.springbootblueprints.repository;

import com.selab.springbootblueprints.model.entity.Ncdatafile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NcDataFileEntityRepository extends JpaRepository<Ncdatafile, Long> {
}
