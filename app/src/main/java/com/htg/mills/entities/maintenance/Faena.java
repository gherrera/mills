package com.htg.mills.entities.maintenance;

import java.util.List;

import com.htg.mills.entities.Entity;

public class Faena extends Entity {

	private static final long serialVersionUID = 4295549137974007846L;

	private String name;
	private List<Molino> molinos;
	private Cliente client;

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Molino> getMolinos() {
		return molinos;
	}
	public void setMolinos(List<Molino> molinos) {
		this.molinos = molinos;
	}
	public Cliente getClient() {
		return client;
	}
	public void setClient(Cliente client) {
		this.client = client;
	}
	
}
