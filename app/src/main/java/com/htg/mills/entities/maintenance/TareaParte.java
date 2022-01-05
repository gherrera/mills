package com.htg.mills.entities.maintenance;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.htg.mills.entities.Entity;

public class TareaParte extends Entity {

	private static final long serialVersionUID = -770295713240661996L;
	
	private Parte part;
	private String user;
	private int qty;
	private TurnoHistorial turno;
	@JsonIgnore
	private String tareaId;
	
	public Parte getPart() {
		return part;
	}
	public void setPart(Parte part) {
		this.part = part;
	}
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public int getQty() {
		return qty;
	}
	public void setQty(int qty) {
		this.qty = qty;
	}
	public String getTareaId() {
		return tareaId;
	}
	public void setTareaId(String tareaId) {
		this.tareaId = tareaId;
	}
	public TurnoHistorial getTurno() {
		return turno;
	}
	public void setTurno(TurnoHistorial turno) {
		this.turno = turno;
	}
	
	
}
