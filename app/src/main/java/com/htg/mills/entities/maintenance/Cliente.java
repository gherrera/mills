package com.htg.mills.entities.maintenance;

import java.util.List;

import com.htg.mills.entities.Entity;

public class Cliente extends Entity {

	private static final long serialVersionUID = -5020525484584664706L;

	private String name;
	private List<Faena> faenas;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Faena> getFaenas() {
		return faenas;
	}
	public void setFaenas(List<Faena> faenas) {
		this.faenas = faenas;
	}
	
	
}
