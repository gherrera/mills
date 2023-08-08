package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Evento {

	public enum Type {
		INTERRUPTION, COMMENT
	}
	
	private Integer id;
	private Type type;
	private String comments;
	private Timestamp startDate;
	private Timestamp finishDate;
	private String userStart;
	private String userFinish;
	@JsonIgnore
	private Etapa stage;

	public Type getType() {
		return type;
	}
	public void setType(Type type) {
		this.type = type;
	}
	public String getComments() {
		return comments;
	}
	public void setComments(String comments) {
		this.comments = comments;
	}
	public Timestamp getFinishDate() {
		return finishDate;
	}
	public void setFinishDate(Timestamp finishDate) {
		this.finishDate = finishDate;
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
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Timestamp getStartDate() {
		return startDate;
	}
	public void setStartDate(Timestamp startDate) {
		this.startDate = startDate;
	}
	public Etapa getStage() {
		return stage;
	}
	public void setStage(Etapa stage) {
		this.stage = stage;
	}
	
	
}
