package com.htg.mills.entities.maintenance;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Scheduled {
	protected static TypeReference<HashMap<Tarea.TareaEnum, Integer>> typeRef = new TypeReference<HashMap<Tarea.TareaEnum, Integer>>() {};
	private static ObjectMapper mapper = new ObjectMapper();
	private static Logger log = LogManager.getLogger(Scheduled.class);

	static {
		mapper.setSerializationInclusion(Include.NON_NULL);
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
	}
	
	private Map<Tarea.TareaEnum, Integer> tasks;
	private List<Programacion> movs;

	public List<Programacion> getMovs() {
		return movs;
	}

	public void setMovs(List<Programacion> movs) {
		this.movs = movs;
	}

	public Map<Tarea.TareaEnum, Integer> getTasks() {
		return tasks;
	}

	public void setTasks(Map<Tarea.TareaEnum, Integer> tasks) {
		this.tasks = tasks;
	}
	
	public void setTasksStr(String tasks) {
		if(tasks != null) {
			try {
				this.tasks = mapper.readValue(tasks, typeRef);
			} catch (IOException e) {
				log.error("Error al deserializar objeto", e);
			}
		}
	}
	
	@JsonIgnore
	public String getTasksStr() {
		if(tasks != null) {
			try {
				return mapper.writeValueAsString(tasks);
			} catch (JsonProcessingException e) {
				log.error("Error al serializar objeto", e);
			}
		}
		return null;
	}

}
