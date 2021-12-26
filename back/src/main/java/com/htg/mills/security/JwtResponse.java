package com.htg.mills.security;

import java.io.Serializable;
import java.util.Date;

public class JwtResponse implements Serializable {

	private static final long serialVersionUID = -6309279889272266798L;
	private String status;
	private String token;
	private Integer code;
	private Date expirationDate;
	private String msg;
	private int timeout;
	
	public JwtResponse(String token) {
		this.status = "OK";
		this.code = 200;
		this.token = token;
	}
	
	public JwtResponse(String status, Integer code, String msg) {
		this.status = status;
		this.code = code;
		this.msg = msg;
	}
	
	public String getToken() {
		return this.token;
	}

	public String getStatus() {
		return status;
	}

	public String getMsg() {
		return msg;
	}

	public Date getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(Date expirationDate) {
		this.expirationDate = expirationDate;
	}

	public Integer getCode() {
		return code;
	}

	public void setCode(Integer code) {
		this.code = code;
	}

	public int getTimeout() {
		return timeout;
	}

	public void setTimeout(int timeout) {
		this.timeout = timeout;
	}
}
