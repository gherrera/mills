package com.htg.mills.entities;

import java.util.List;

import com.htg.mills.entities.maintenance.Programacion;

public class ScheduleStatus {

	private String status;
	private String message;
	private List<Programacion> sheduled;

	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public List<Programacion> getSheduled() {
		return sheduled;
	}
	public void setSheduled(List<Programacion> sheduled) {
		this.sheduled = sheduled;
	}
	
	
}
