package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;

import com.htg.mills.entities.Entity;

public class Activity extends Entity {

	private static final long serialVersionUID = -2554575265878715857L;

	private Timestamp dateLog;
	private String user;
	private String turno;
	private String entity;
	private String extId;
	private String operation;
	private String params;

	public Timestamp getDateLog() {
		return dateLog;
	}
	public void setDateLog(Timestamp dateLog) {
		this.dateLog = dateLog;
	}
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public String getTurno() {
		return turno;
	}
	public void setTurno(String turno) {
		this.turno = turno;
	}
	public String getEntity() {
		return entity;
	}
	public void setEntity(String entity) {
		this.entity = entity;
	}
	public String getExtId() {
		return extId;
	}
	public void setExtId(String extId) {
		this.extId = extId;
	}
	public String getOperation() {
		return operation;
	}
	public void setOperation(String operation) {
		this.operation = operation;
	}
	public String getParams() {
		return params;
	}
	public void setParams(String params) {
		this.params = params;
	}

	
}
