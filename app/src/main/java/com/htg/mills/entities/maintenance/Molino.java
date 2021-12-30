package com.htg.mills.entities.maintenance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.htg.mills.entities.Entity;

public class Molino extends Entity {

	private static final long serialVersionUID = 5909054053178398826L;

	public enum Status {
		ACTIVE, INACTIVE
	}
	
	private String name;
	private String type;
	private Status status;
	private Etapa.EtapaEnum stage;
	private List<Etapa> stages;
	private List<Turno> turns;
	private List<Parte> parts;
	private Faena faena;
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Etapa.EtapaEnum getStage() {
		return stage;
	}

	public void setStage(Etapa.EtapaEnum stage) {
		this.stage = stage;
	}

	public List<Etapa> getStages() {
		return stages;
	}

	public void setStages(List<Etapa> stages) {
		this.stages = stages;
	}

	public List<Turno> getTurns() {
		return turns;
	}

	public void setTurns(List<Turno> turns) {
		this.turns = turns;
	}

	public List<Parte> getParts() {
		return parts;
	}

	public void setParts(List<Parte> parts) {
		this.parts = parts;
	}

	public Faena getFaena() {
		return faena;
	}

	public void setFaena(Faena faena) {
		this.faena = faena;
	}
	
	public List<Map<String, Object>> getPartsByType() {
		Map<String, List<Parte>> mParts = new HashMap<String, List<Parte>>();
		List<Map<String, Object>> _parts = new ArrayList<Map<String, Object>>();
		if(parts != null) {
			for(Parte parte : parts) {
				List<Parte> p = mParts.get(parte.getType());
				if(p == null) {
					p = new ArrayList<Parte>();
					mParts.put(parte.getType(), p);
				}
				p.add(parte);
			}
			for(String type : mParts.keySet()) {
				Map<String, Object> p = new HashMap<String, Object>();
				p.put("type", type);
				p.put("parts", mParts.get(type));
				_parts.add(p);
			}
		}
		return _parts;
	}
	
	public int getHours() {
		return 0;
	}
	
	public float getPercentage() {
		int total = 0;
		float montadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				total += parte.getQty();
				montadas += parte.getMontadas();
			}
		}
		return montadas/total;
	}
	
}
