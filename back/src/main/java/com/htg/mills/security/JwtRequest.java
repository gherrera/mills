package com.htg.mills.security;

import io.swagger.annotations.ApiModelProperty;

public class JwtRequest {

	@ApiModelProperty(required = true)
	private String username;
	@ApiModelProperty(required = true)
	private String password;
	@ApiModelProperty(required = false)
	private long time;

	public JwtRequest() {
	}
	
	public JwtRequest(String username, String password) {
		this.setUsername(username);
		this.setPassword(password);
	}
	
	public String getUsername() {
		return this.username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getPassword() {
		return this.password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}

	public long getTime() {
		return time;
	}

	public void setTime(long time) {
		this.time = time;
	}
}
