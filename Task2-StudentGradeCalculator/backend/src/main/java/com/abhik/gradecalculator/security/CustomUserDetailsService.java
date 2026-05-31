package com.abhik.gradecalculator.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final PersistentUserStore persistentUserStore;

    public CustomUserDetailsService(PersistentUserStore persistentUserStore) {
        this.persistentUserStore = persistentUserStore;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return persistentUserStore.loadUserByUsername(username);
    }

    public void saveUser(String email, UserDetails user) {
        persistentUserStore.saveUser(email, user);
    }

    public boolean userExists(String email) {
        return persistentUserStore.userExists(email);
    }
}
