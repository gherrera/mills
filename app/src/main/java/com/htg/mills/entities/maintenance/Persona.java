package com.htg.mills.entities.maintenance;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Persona {

	private String name;
	private String rut;
	private String role;
	private String controllerId;
	@JsonIgnore
	private String turnoId;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getRut() {
		return rut;
	}
	public void setRut(String rut) {
		this.rut = rut;
	}
	public String getControllerId() {
		return controllerId;
	}
	public void setControllerId(String controllerId) {
		this.controllerId = controllerId;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getTurnoId() {
		return turnoId;
	}
	public void setTurnoId(String turnoId) {
		this.turnoId = turnoId;
	}
	
}
