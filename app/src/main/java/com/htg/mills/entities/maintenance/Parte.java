package com.htg.mills.entities.maintenance;

import com.htg.mills.entities.Entity;

public class Parte extends Entity {

	private static final long serialVersionUID = -7569055607914820403L;

	private String name;
	private String type;
	private int qty;
	
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
	public int getQty() {
		return qty;
	}
	public void setQty(int qty) {
		this.qty = qty;
	}
}
