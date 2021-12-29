package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;

public class TurnoHistorial {

	private Turno.Status status;
	private Timestamp openDate;
	private Timestamp closedDate;
	
	public Turno.Status getStatus() {
		return status;
	}
	public void setStatus(Turno.Status status) {
		this.status = status;
	}
	public Timestamp getOpenDate() {
		return openDate;
	}
	public void setOpenDate(Timestamp openDate) {
		this.openDate = openDate;
	}
	public Timestamp getClosedDate() {
		return closedDate;
	}
	public void setClosedDate(Timestamp closedDate) {
		this.closedDate = closedDate;
	}

	
}
