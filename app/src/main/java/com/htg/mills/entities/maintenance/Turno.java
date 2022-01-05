package com.htg.mills.entities.maintenance;

import java.util.List;

import com.htg.mills.entities.Entity;

public class Turno extends Entity {
	
	private static final long serialVersionUID = -326189179290847155L;
	
	public enum Status {
		OPEN, CLOSED
	}
	
	private String name;
	private Status status;
	private String turnoId;
	private List<Persona> personas;
	private Molino molino;
	private List<TurnoHistorial> history;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Status getStatus() {
		return status;
	}
	public void setStatus(Status status) {
		this.status = status;
	}
	public Molino getMolino() {
		return molino;
	}
	public void setMolino(Molino molino) {
		this.molino = molino;
	}
	public List<Persona> getPersonas() {
		return personas;
	}
	public void setPersonas(List<Persona> personas) {
		this.personas = personas;
	}
	public List<TurnoHistorial> getHistory() {
		return history;
	}
	public void setHistory(List<TurnoHistorial> history) {
		this.history = history;
	}
	public String getTurnoId() {
		return turnoId;
	}
	public void setTurnoId(String turnoId) {
		this.turnoId = turnoId;
	}

}
