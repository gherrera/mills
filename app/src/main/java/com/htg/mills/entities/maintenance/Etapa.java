package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;
import java.util.List;

import com.htg.mills.entities.Entity;

public class Etapa extends Entity {

	private static final long serialVersionUID = -2688067409495593833L;

	public enum EtapaEnum {
		BEGINNING, EXECUTION, FINISHED
	}
	
	public enum Status {
		STARTED, FINISHED
	}
	
	private EtapaEnum stage;
	private Timestamp finishDate;
	private Status status;
	private String userStart;
	private String userFinish;
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

}
