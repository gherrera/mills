package com.htg.mills.entities.maintenance;

import java.util.List;

import com.htg.mills.entities.Entity;

public class Cliente extends Entity {

	private static final long serialVersionUID = -5020525484584664706L;

	private String name;
	private String rut;
	private String address;
	private String contactName;
	private String contactPhone;
	private String email;
	private List<Faena> faenas;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Faena> getFaenas() {
		return faenas;
	}
	public void setFaenas(List<Faena> faenas) {
		this.faenas = faenas;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getContactName() {
		return contactName;
	}
	public void setContactName(String contactName) {
		this.contactName = contactName;
	}
	public String getContactPhone() {
		return contactPhone;
	}
	public void setContactPhone(String contactPhone) {
		this.contactPhone = contactPhone;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getRut() {
		return rut;
	}
	public void setRut(String rut) {
		this.rut = rut;
	}
	
	
}
