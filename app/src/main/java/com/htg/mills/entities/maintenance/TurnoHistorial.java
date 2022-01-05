package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;

import com.htg.mills.entities.Entity;

public class TurnoHistorial extends Entity {

	private static final long serialVersionUID = -5999988025143691277L;
	
	private Timestamp closedDate;
	private Turno turno;

	public Timestamp getClosedDate() {
		return closedDate;
	}
	public void setClosedDate(Timestamp closedDate) {
		this.closedDate = closedDate;
	}
	public Turno getTurno() {
		return turno;
	}
	public void setTurno(Turno turno) {
		this.turno = turno;
	}

	
}
