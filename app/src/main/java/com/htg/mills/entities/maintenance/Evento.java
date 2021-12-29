package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;

import com.htg.mills.entities.Entity;

public class Evento extends Entity {

	private static final long serialVersionUID = -2666426991754626459L;

	public enum Type {
		INTERRUPTION
	}
	
	private Type type;
	private String comments;
	private Timestamp finishDate;
	private String userStart;
	private String userFinish;

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
	
	
}
