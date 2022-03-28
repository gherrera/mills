package com.htg.mills.entities.maintenance;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import com.htg.mills.entities.Entity;

public class Tarea extends Entity {

	private static final long serialVersionUID = -6001580767604865047L;

	public enum TareaEnum {
		
		DET_PLANTA(0, "Detencion de Planta"), BLOQUEO_PRUEBA_ENERGIA_0(1, "Bloqueo Prueba de Energia 0"), 
		RETIRO_CHUTE(2, "Retiro Chute"), ING_LAINERA(3, "Ingreso Lainera"),
		BOTADO(4, "Botado"), LIMPIEZA(5, "Limpieza"), MONTAJE(6, "Montaje"), GIRO(7, "Giro"),
		RET_LAINERA(8, "Retiro Lainera"), INST_CHUTE(9, "Instalacion Chute"), DESBLOQUEO(10, "Desbloqueo"), REAPRIETE(11, "Reapriete");

		private final int order;
		private final String value;

		private TareaEnum(int order, String value) {
			this.order = order;
			this.value = value;
		}
		
		public int getOrder() {
			return order;
		}
		public String getText() { 
			return value;
		}
	}
	
	private TareaEnum task;
	private Timestamp finishDate;
	private String userStart;
	private String userFinish;
	private TurnoHistorial turnoStart;
	private TurnoHistorial turnoFinish;
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
	public TurnoHistorial getTurnoStart() {
		return turnoStart;
	}
	public void setTurnoStart(TurnoHistorial turnoStart) {
		this.turnoStart = turnoStart;
	}
	public TurnoHistorial getTurnoFinish() {
		return turnoFinish;
	}
	public void setTurnoFinish(TurnoHistorial turnoFinish) {
		this.turnoFinish = turnoFinish;
	}
	
	public int getDuration() {
		int seg = 0;
		
		Timestamp finish = finishDate;
		if(finish == null) {
			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			finish = new Timestamp(date.getTime());
		}
		if(turnoFinish != null && turnoStart != null && !turnoStart.getId().equals(turnoFinish.getId())) {
			if(turnoStart.getClosedDate() != null && turnoStart.getClosedDate().before(finish)) {
				Timestamp finish1 = turnoStart.getClosedDate();
				
				long diff = finish1.getTime() - getCreationDate().getTime();
				seg += (int)diff / 1000;
			}
			if(turnoFinish.getCreationDate() != null && turnoFinish.getCreationDate().before(finish)) {
				long diff = finish.getTime() - turnoFinish.getCreationDate().getTime();
				seg += (int)diff / 1000;
			}
		}else { // Hay cambio de turno
			long diff = finish.getTime() - getCreationDate().getTime();
			seg = (int)diff / 1000;
		}
		return seg;
	}
}
