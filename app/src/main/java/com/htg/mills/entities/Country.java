package com.htg.mills.entities;

import java.util.TimeZone;

public class Country {

	private String code;
	private String name;
	private TimeZone timeZone;
	private int diffMiliseconds;
	
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public TimeZone getTimeZone() {
		return timeZone;
	}
	public void setTimeZone(TimeZone timeZone) {
		this.timeZone = timeZone;
	}
	public void setStrTimeZone(String timeZone) {
		this.timeZone = TimeZone.getTimeZone(timeZone);
	}
	public int getDiffMiliseconds() {
		return diffMiliseconds;
	}
	public void setDiffMiliseconds(int diffMiliseconds) {
		this.diffMiliseconds = diffMiliseconds;
	}
	
	
}
