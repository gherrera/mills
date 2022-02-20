package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.htg.mills.entities.Entity;

public class Molino extends Entity {

	private static final long serialVersionUID = 5909054053178398826L;

	public enum StatusAdmin {
		ACTIVE, INACTIVE
	}
	
	public enum Status {
		STARTED, FINISHED
	}

	private String name;
	private String type;
	private StatusAdmin statusAdmin;
	private Status status;
	private Etapa.EtapaEnum stage;
	private List<Etapa> stages;
	private List<Turno> turns;
	private List<Parte> parts;
	private Faena faena;
	private Integer hours;
	private String ordenTrabajo;
	private Timestamp updateDate;
	private String updateUser;

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
	
	public float getPercentage() {
		int total = 0;
		float montadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				total += parte.getQty();
				montadas += parte.getTotalMontadas();
			}
		}
		return montadas/total;
	}
	
	public float getPiezas() {
		int total = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				total += parte.getQty();
			}
		}
		return total;
	}
	
	public int getBotadas() {
		int botadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				botadas += parte.getBotadas();
			}
		}
		return botadas;
	}
	
	public int getLimpiadas() {
		int limpiadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				limpiadas += parte.getLimpiadas();
			}
		}
		return limpiadas;
	}
	
	public int getMontadas() {
		int montadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				montadas += parte.getMontadas();
			}
		}
		return montadas;
	}
	
	public int getTotalMontadas() {
		int montadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				montadas += parte.getTotalMontadas();
			}
		}
		return montadas;
	}
	
	public int getGiros() {
		int giros = 0;
		if(stages != null) {
			for(Etapa stage : stages) {
				if(stage.getStage().equals(Etapa.EtapaEnum.EXECUTION) && stage.getTasks() != null) {
					for(Tarea tarea : stage.getTasks()) {
						if(tarea.getTask().equals(Tarea.TareaEnum.GIRO)) giros++;
					}
				}
			}
		}
		return giros;
	}

	public StatusAdmin getStatusAdmin() {
		return statusAdmin;
	}

	public void setStatusAdmin(StatusAdmin statusAdmin) {
		this.statusAdmin = statusAdmin;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}
	
	public Etapa getCurrentStage() {
		if(stages != null && stages.size() >0) {
			return stages.get(stages.size()-1);
		}
		return null;
	}
	
	private Tarea.TareaEnum getNextTaskByStage(Etapa etapa) {
		Tarea.TareaEnum next = null;
		if(etapa != null) {
			next = etapa.getNextTask();
			Tarea current = etapa.getCurrentTask();
			if(etapa.getStage().equals(Etapa.EtapaEnum.EXECUTION) && current != null && current.getFinishDate() != null) {
				if(Tarea.TareaEnum.GIRO.equals(next) && getTotalMontadas() == getPiezas()) {
					next = null;
				}
			}
		}
		return next;
	}
	
	public Tarea.TareaEnum getNextTask() {
		return getNextTaskByStage(getCurrentStage());
	}
	
	public Tarea.TareaEnum getNextTask(Etapa etapa) {
		return getNextTaskByStage(etapa);
	}

	public Integer getHours() {
		return hours;
	}

	public void setHours(Integer hours) {
		this.hours = hours;
	}

	public Timestamp getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Timestamp updateDate) {
		this.updateDate = updateDate;
	}

	public String getUpdateUser() {
		return updateUser;
	}

	public void setUpdateUser(String updateUser) {
		this.updateUser = updateUser;
	}

	public String getOrdenTrabajo() {
		return ordenTrabajo;
	}

	public void setOrdenTrabajo(String ordenTrabajo) {
		this.ordenTrabajo = ordenTrabajo;
	}

}
