package com.htg.mills.entities;

import java.util.List;
import java.util.Map;

public class Results {
	private int total;
	private List<? extends Object> records;
	private Map<String, Object> filters;
	
	public int getTotal() {return total;}
	public List<? extends Object> getRecords() {return records;}
	public Map<String, Object> getFilters() {return filters;}
	
	public void setTotal(int total) {this.total = total;}
	public void setRecords(List<? extends Object> records) {this.records = records;}
	public void setFilters(Map<String, Object> filters) {this.filters = filters;}
}
