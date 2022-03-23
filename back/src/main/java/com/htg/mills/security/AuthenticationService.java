package com.htg.mills.security;

import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.htg.mills.app.App;
import com.htg.mills.entities.CurrentUser;
import com.htg.mills.entities.Status;
import com.htg.mills.entities.Token;
import com.htg.mills.entities.Usuario;

@Service
public class AuthenticationService implements UserDetailsService {
	private static Logger log = LogManager.getLogger(AuthenticationService.class);
	
	@Autowired
    private LoginAttemptService loginAttemptService;

	@Autowired
	private App app;
	
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CurrentUser currentUser;
        List<GrantedAuthority> grantList= new ArrayList<GrantedAuthority>();
        int maxSessions = -1;
        int timeout = 120;
        Usuario user = app.getUserByLogin(username);
    	
        //log.debug("User: "+ user);
    	if(user != null) {
        	GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_CLIENT");
            grantList.add(authority);
            if(user.getType().equals(Usuario.Type.CONTROLLER)) timeout = 600;
    	}else {
            throw new UsernameNotFoundException("User " + username + " was not found in the database");
        }
        boolean enabled = user.getStatus().equals(Status.ACTIVE);
        boolean locked = loginAttemptService.isBlocked(username);
        
        String passwd = "{SHA-256}"+user.getPassword();
    	currentUser = new CurrentUser(user.getId(), username, passwd, enabled, locked, maxSessions, timeout*60, grantList);
    	currentUser.setUser(user);
        return currentUser;
    }
    
    public Token getToken(String token) {
    	return app.getToken(token);
    }

}
