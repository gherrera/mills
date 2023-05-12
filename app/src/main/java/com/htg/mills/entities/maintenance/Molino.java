package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.htg.mills.entities.Entity;
import com.htg.mills.entities.maintenance.Tarea.TareaEnum;

public class Molino extends Entity {

	private static final long serialVersionUID = 5909054053178398826L;

	public enum StatusAdmin {
		ACTIVE, INACTIVE
	}
	
	public enum Status {
		STARTED, FINISHED
	}

	private String createUser;
	private int nro;
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
	private Integer exHours;
	private String ordenTrabajo;
	private Timestamp updateDate;
	private String updateUser;
	private Timestamp finishDate;
	private Scheduled scheduled;
	@JsonIgnore
	private Float percentageVal;

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
		if(percentageVal != null) {
			return percentageVal;
		}

		int total = 0;
		float movs = 0;
		if(stages != null && scheduled != null) {
			if(scheduled.getMovs() != null) {
				total = scheduled.getMovs().stream().mapToInt(Programacion::getTotal).sum();
			}
			
			for(Etapa stage : stages) {
				if(Etapa.EtapaEnum.BEGINNING.equals(stage.getStage()) || Etapa.EtapaEnum.FINISHED.equals(stage.getStage())) {
					if(stage.getTasks() != null && scheduled.getTasks() != null) {
						for(Tarea task : stage.getTasks()) {
							if(task.getFinishDate() != null) {
								Integer mov = scheduled.getTasks().get(task.getTask());
								if(mov != null) {
									movs += mov;
								}
							}
						}
					}
				}else if(Etapa.EtapaEnum.EXECUTION.equals(stage.getStage())) {
					if(stage.getTasks() != null) {
						for(Tarea task : stage.getTasks()) {
							if(TareaEnum.GIRO.equals(task.getTask())) {
								if(task.getFinishDate() != null && scheduled.getTasks() != null) {
									Integer mov = scheduled.getTasks().get(task.getTask());
									if(mov != null) {
										movs += mov;
									}
								}
							}else if(TareaEnum.BOTADO.equals(task.getTask()) || TareaEnum.MONTAJE.equals(task.getTask())) {
								if(task.getParts() != null) {
									for(TareaParte part : task.getParts()) {
										movs += part.getQty();
									}
								}
							}
						}
					}
				}
			}
		}
		return total == 0 ? 0 : (movs/total);
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
	
	public int getTotalBotadas() {
		int botadas = 0;
		if(parts != null) {
			for(Parte parte : parts) {
				botadas += parte.getTotalBotadas();
			}
		}
		return botadas;
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
				if(Tarea.TareaEnum.GIRO.equals(next)) {
					if(getTotalMontadas() == getPiezas()) {
						next = null;
					}
				}else if(Tarea.TareaEnum.GIRO.equals(current.getTask())) {
					if(getTotalBotadas() == getPiezas()) {
						next = Tarea.TareaEnum.MONTAJE;
					}
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

	public int getNro() {
		return nro;
	}

	public void setNro(int nro) {
		this.nro = nro;
	}
	
	public Timestamp getStartDate() {
		if(stages != null) {
			for(Etapa st : stages) {
				if(st.getStage().equals(Etapa.EtapaEnum.BEGINNING)) return st.getCreationDate();
			}
		}
		return null;
	}

	public String getCreateUser() {
		return createUser;
	}

	public void setCreateUser(String createUser) {
		this.createUser = createUser;
	}

	public long getRealDuration() {
		long duration = 0;
		if(stages != null && stages.size() >0) {
			Timestamp finish = getFinishDate();
			if(finish == null) {
				Calendar c = Calendar.getInstance(TimeZone.getDefault());
				Date date = c.getTime();
				finish = new Timestamp(date.getTime());
			}
			long diff = finish.getTime() - stages.get(0).getCreationDate().getTime();
			duration = diff / 1000;
		}
		return duration;
	}
	
	public long getDuration() {
		long duration = 0;
		if(stages != null) {
			for(Etapa stage : stages) {
				duration += stage.getDuration();
			}
		}
		return duration;
	}

	public Timestamp getFinishDate() {
		return finishDate;
	}

	public void setFinishDate(Timestamp finishDate) {
		this.finishDate = finishDate;
	}
	
	public List<TurnoHistorial> getTurnoHistorial() {
		List<TurnoHistorial> turnos = new ArrayList<TurnoHistorial>();
		if(turns != null) {
			for(Turno turno : turns) {
				if(turno.getHistory() != null) turnos.addAll(turno.getHistory());
			}
		}
		Collections.sort(turnos, new Comparator<TurnoHistorial>() {
			@Override
			public int compare(TurnoHistorial t1, TurnoHistorial t2) {
				return t1.getCreationDate().compareTo(t2.getCreationDate());
			}
		});
		
		return turnos;
	}

	public Integer getExHours() {
		return exHours;
	}

	public void setExHours(Integer exHours) {
		this.exHours = exHours;
	}

	public Scheduled getScheduled() {
		return scheduled;
	}

	public void setScheduled(Scheduled scheduled) {
		this.scheduled = scheduled;
	}

	public Float getPercentageVal() {
		return percentageVal;
	}

	public void setPercentageVal(Float percentageVal) {
		this.percentageVal = percentageVal;
	}

}
