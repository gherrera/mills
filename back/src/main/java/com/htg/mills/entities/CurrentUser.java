package com.htg.mills.entities;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class CurrentUser extends User {

	private static final long serialVersionUID = 1321547707726174419L;
	
	private String id;
	private Usuario user;
	private int maxSessions;
	private int timeout;
	
	public CurrentUser(String id, String username, String password, boolean enabled, boolean locked, int maxSessions, int timeout, Collection<? extends GrantedAuthority> authorities) {
		super(username, password, enabled, true, true, !locked, authorities);
		this.id = id;
		this.maxSessions = maxSessions;
		this.timeout = timeout;
	}

	public Usuario getUser() {
		return user;
	}

	public void setUser(Usuario user) {
		this.user = user;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public int getMaxSessions() {
		return maxSessions;
	}

	public void setMaxSessions(int maxSessions) {
		this.maxSessions = maxSessions;
	}

	public int getTimeout() {
		return timeout;
	}

	public void setTimeout(int timeout) {
		this.timeout = timeout;
	}

}
