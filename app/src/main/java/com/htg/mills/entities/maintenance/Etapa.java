package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import com.htg.mills.entities.Entity;

public class Etapa extends Entity {

	private static final long serialVersionUID = -2688067409495593833L;

	public enum EtapaEnum {
		BEGINNING, EXECUTION, FINISHED, DELIVERY
	}
	
	public enum Status {
		STARTED, FINISHED
	}
	
	private EtapaEnum stage;
	private Timestamp finishDate;
	private Status status;
	private String userStart;
	private String userFinish;
	private TurnoHistorial turnoStart;
	private TurnoHistorial turnoFinish;
	private List<Tarea> tasks;
	private List<Evento> events;

	public Timestamp getFinishDate() {
		return finishDate;
	}

	public void setFinishDate(Timestamp finishDate) {
		this.finishDate = finishDate;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public String getUserStart() {
		return userStart;
	}

	public void setUserStart(String userStart) {
		this.userStart = userStart;
	}

	public String getUserFinish() {
		return userFinish;
	}

	public void setUserFinish(String userFinish) {
		this.userFinish = userFinish;
	}

	public EtapaEnum getStage() {
		return stage;
	}

	public void setStage(EtapaEnum stage) {
		this.stage = stage;
	}

	public List<Tarea> getTasks() {
		return tasks;
	}

	public void setTasks(List<Tarea> tasks) {
		this.tasks = tasks;
	}

	public List<Evento> getEvents() {
		return events;
	}

	public void setEvents(List<Evento> events) {
		this.events = events;
	}

	public Tarea getCurrentTask() {
		Tarea task = null;
		if(tasks != null) {
			for(Tarea t : tasks) {
				if(task == null) task = t;
				else if(t.getCreationDate().after(task.getCreationDate())) task = t;
				else if(t.getTask().getOrder() > task.getTask().getOrder()) task = t;
			}
		}
		return task;
	}

	public Tarea.TareaEnum getNextTask() {
		Tarea current = getCurrentTask();
		if(stage.equals(EtapaEnum.BEGINNING)) {
			if(current == null) {
				return Tarea.TareaEnum.DET_PLANTA;
			}else if(current.getTask().equals(Tarea.TareaEnum.DET_PLANTA)) {
				return Tarea.TareaEnum.BLOQUEO_PRUEBA_ENERGIA_0;
			}else if(current.getTask().equals(Tarea.TareaEnum.BLOQUEO_PRUEBA_ENERGIA_0)) {
				return Tarea.TareaEnum.RETIRO_CHUTE;
			}else if(current.getTask().equals(Tarea.TareaEnum.RETIRO_CHUTE)) {
				return Tarea.TareaEnum.ING_LAINERA;
			}
		}else if(stage.equals(EtapaEnum.EXECUTION)) {
			if(current == null) {
				return Tarea.TareaEnum.BOTADO;
			}else if(current.getTask().equals(Tarea.TareaEnum.BOTADO)) {
				return Tarea.TareaEnum.LIMPIEZA;
			}else if(current.getTask().equals(Tarea.TareaEnum.LIMPIEZA)) {
				return Tarea.TareaEnum.MONTAJE;
			}else if(current.getTask().equals(Tarea.TareaEnum.MONTAJE)) {
				return Tarea.TareaEnum.GIRO;
			}else if(current.getTask().equals(Tarea.TareaEnum.GIRO)) {
				return Tarea.TareaEnum.BOTADO;
			}
		}else if(stage.equals(EtapaEnum.FINISHED)) {
			if(current == null) {
				return Tarea.TareaEnum.RET_LAINERA;
			}else if(current.getTask().equals(Tarea.TareaEnum.RET_LAINERA)) {
				return Tarea.TareaEnum.INST_CHUTE;
			}else if(current.getTask().equals(Tarea.TareaEnum.INST_CHUTE)) {
				return Tarea.TareaEnum.DESBLOQUEO;
			}else if(current.getTask().equals(Tarea.TareaEnum.DESBLOQUEO) && Status.STARTED.equals(status)) {
				return Tarea.TareaEnum.REAPRIETE;
			}
		}
		return null;
	}

	public TurnoHistorial getTurnoStart() {
		return turnoStart;
	}

	public void setTurnoStart(TurnoHistorial turnoStart) {
		this.turnoStart = turnoStart;
	}

	public TurnoHistorial getTurnoFinish() {
		return turnoFinish;
	}

	public void setTurnoFinish(TurnoHistorial turnoFinish) {
		this.turnoFinish = turnoFinish;
	}
	
	public boolean getHasInterruption() {
		if(events != null) {
			for(Evento evt : events) {
				if(evt.getType().equals(Evento.Type.INTERRUPTION) && evt.getFinishDate() == null) {
					return true;
				}
			}
		}
		return false;
	}
	
	public long getRealDuration() {
		Timestamp finish = getFinishDate();
		if(finish == null) {
			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			finish = new Timestamp(date.getTime());
		}
		long diff = finish.getTime() - getCreationDate().getTime();
		return diff / 1000;
	}
	
	public long getDuration() {
		long duration = 0;
		if(tasks != null) {
			for(Tarea t : tasks) {
				if(!t.getTask().equals(Tarea.TareaEnum.LIMPIEZA)) duration += t.getDuration();
			}
		}
		return duration;
	}

}
