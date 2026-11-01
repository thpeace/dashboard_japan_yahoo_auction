package com.yahoo.auction.repository;

import com.yahoo.auction.entity.ClientUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientUserRepository extends JpaRepository<ClientUser, Long> {
    Optional<ClientUser> findByUsername(String username);

    Optional<ClientUser> findByEmail(String email);
}
