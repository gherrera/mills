package com.htg.mills.entities.maintenance;

import com.htg.mills.entities.Entity;

public class Parte extends Entity {

	private static final long serialVersionUID = -7569055607914820403L;

	private String name;
	private String type;
	private int qty;
	private int botadas;
	private int limpiadas;
	private int montadas;
	private int totalBotadas;
	private int totalLimpiadas;
	private int totalMontadas;
	
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
	public int getBotadas() {
		return botadas;
	}
	public void setBotadas(int botadas) {
		this.botadas = botadas;
	}
	public int getLimpiadas() {
		return limpiadas;
	}
	public void setLimpiadas(int limpiadas) {
		this.limpiadas = limpiadas;
	}
	public int getMontadas() {
		return montadas;
	}
	public void setMontadas(int montadas) {
		this.montadas = montadas;
	}
	public int getTotalBotadas() {
		return totalBotadas;
	}
	public void setTotalBotadas(int totalBotadas) {
		this.totalBotadas = totalBotadas;
	}
	public int getTotalLimpiadas() {
		return totalLimpiadas;
	}
	public void setTotalLimpiadas(int totalLimpiadas) {
		this.totalLimpiadas = totalLimpiadas;
	}
	public int getTotalMontadas() {
		return totalMontadas;
	}
	public void setTotalMontadas(int totalMontadas) {
		this.totalMontadas = totalMontadas;
	}
}
