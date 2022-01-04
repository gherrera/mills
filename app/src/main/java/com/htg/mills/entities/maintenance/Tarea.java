package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;
import java.util.List;

import com.htg.mills.entities.Entity;

public class Tarea extends Entity {

	private static final long serialVersionUID = -6001580767604865047L;

	public enum TareaEnum {
		
		DET_PLANTA("Detencion de Planta"), BLOQUEO_PRUEBA_ENERGIA_0("Bloqueo Prueba de Energia 0"), 
		RETIRO_CHUTE("Retiro Chute"), ING_LAINERA("Ingreso Lainera"),
		BOTADO("Botado"), LIMPIEZA("Limpieza"), MONTAJE("Montaje"), GIRO("Giro"),
		RET_LAINERA("Retiro Lainera"), INST_CHUTE("Instalacion Chute"), DESBLOQUEO("Desbloqueo");

		private final String value;

		private TareaEnum(String value) {
			this.value = value;
		}
		
		public String getText() { 
			return value;
		}
	}
	
	private TareaEnum task;
	private Timestamp finishDate;
	private String userStart;
	private String userFinish;
	private List<TareaParte> parts;
	
	public TareaEnum getTask() {
		return task;
	}
	public void setTask(TareaEnum task) {
		this.task = task;
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
	public List<TareaParte> getParts() {
		return parts;
	}
	public void setParts(List<TareaParte> parts) {
		this.parts = parts;
	}
}
