package com.htg.mills.entities;

import java.io.Serializable;
import java.sql.Timestamp;

public class Entity implements Serializable {
	
	private static final long serialVersionUID = -1996021308952577830L;

	protected static char separator = (char)9;

	private String id;
	private Timestamp creationDate;

	public Timestamp getCreationDate() {return creationDate;}
	public void setCreationDate(Timestamp creationDate) {
		this.creationDate = creationDate;
	}
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
}
