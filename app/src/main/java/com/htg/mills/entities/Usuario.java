package com.htg.mills.entities;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import com.htg.mills.entities.maintenance.Cliente;

public class Usuario extends Entity {

	private static final long serialVersionUID = 3252267236423407518L;
	public enum Type {
		ADMIN, CONTROLLER, DASHBOARD;
	};
	private static Pattern pattern = Pattern.compile("^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");

	private String login;
	private String name;
	private String email;
	private Type type;
	private List<String> modules;
	private Status status;
	@JsonProperty(access = Access.WRITE_ONLY)
	private String password;
	private Timestamp feActivacion;
	private Cliente client;
	
	public String getLogin() {return login;}
	public String getName() {return name;}
	public String getEmail() {return email;}
	public Type getType() {return type;}
	public List<String> getModules() {return modules;}

	public void setLogin(String login) {this.login = login;}
	public void setName(String name) {this.name = name;}
	public void setEmail(String email) {this.email = email;}
	public void setType(Type type) {this.type = type;}
	public void setModules(List<String> modules) {this.modules = modules;}
	
	public boolean validateEmail() {
		if(email == null) return false;
		Matcher matcher = pattern.matcher(email);
		return matcher.matches();
	}
	
	public boolean validate() {
		if(email == null || email.equals("")) {
			return false;
		}
		if(login == null || login.equals("")) {
			return false;
		}
		if(name == null || name.equals("")) {
			return false;
		}
		if(type == null) {
			return false;
		}
		return true;
	}
	
	public boolean hasModule(String module) {
		if(modules != null) {
			return modules.contains(module);
		}
		return false;
	}
	
	@JsonIgnore
	public String getModulesStr() {
		if(modules != null) {
			return StringUtils.join(modules,",");
		}
		return "";
	}
	
	public void setModulesStr(String modules) {
		if(modules != null && !"".equals(modules)) {
			setModules(Arrays.asList(modules.split(",")));
		}
	}
	public Status getStatus() {
		return status;
	}
	public void setStatus(Status status) {
		this.status = status;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Timestamp getFeActivacion() {
		return feActivacion;
	}
	public void setFeActivacion(Timestamp feActivacion) {
		this.feActivacion = feActivacion;
	}
	public Cliente getClient() {
		return client;
	}
	public void setClient(Cliente client) {
		this.client = client;
	}
	
}
