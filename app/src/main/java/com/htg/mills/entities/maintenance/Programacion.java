package com.htg.mills.entities.maintenance;

public class Programacion {

	private Integer id;
	private String turn;
	private Integer corrHour;
	private Integer turnHour;
	private Integer unit;
	private Integer movs;
	private Integer total;
	private Integer mounted;
	private Integer twists;
	
	public String getTurn() {
		return turn;
	}
	public void setTurn(String turn) {
		this.turn = turn;
	}
	public Integer getCorrHour() {
		return corrHour;
	}
	public void setCorrHour(Integer corrHour) {
		this.corrHour = corrHour;
	}
	public Integer getTurnHour() {
		return turnHour;
	}
	public void setTurnHour(Integer turnHour) {
		this.turnHour = turnHour;
	}
	public Integer getUnit() {
		return unit;
	}
	public void setUnit(Integer unit) {
		this.unit = unit;
	}
	public Integer getMovs() {
		return movs;
	}
	public void setMovs(Integer movs) {
		this.movs = movs;
	}
	public Integer getTotal() {
		return total;
	}
	public void setTotal(Integer total) {
		this.total = total;
	}
	public Integer getMounted() {
		return mounted;
	}
	public void setMounted(Integer mounted) {
		this.mounted = mounted;
	}
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Integer getTwists() {
		return twists;
	}
	public void setTwists(Integer twists) {
		this.twists = twists;
	}
}
