package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;

public class TurnoHistorial {

	private Timestamp openDate;
	private Timestamp closedDate;

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
