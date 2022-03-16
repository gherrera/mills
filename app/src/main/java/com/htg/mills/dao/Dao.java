package com.htg.mills.dao;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.joda.time.DateTimeZone;

import com.htg.mills.entities.Token;
import com.htg.mills.entities.Usuario;
import com.htg.mills.entities.maintenance.Cliente;
import com.htg.mills.entities.maintenance.Etapa;
import com.htg.mills.entities.maintenance.Evento;
import com.htg.mills.entities.maintenance.Faena;
import com.htg.mills.entities.maintenance.Molino;
import com.htg.mills.entities.maintenance.Molino.StatusAdmin;
import com.htg.mills.entities.maintenance.Parte;
import com.htg.mills.entities.maintenance.Persona;
import com.htg.mills.entities.maintenance.Tarea;
import com.htg.mills.entities.maintenance.TareaParte;
import com.htg.mills.entities.maintenance.Turno;
import com.htg.mills.entities.maintenance.TurnoHistorial;
import com.ibatis.sqlmap.client.SqlMapClient;

public class Dao {

	private static Logger log = LogManager.getLogger(Dao.class);
	private static DateTimeZone dtZone;

	private SqlMapClient sqlMap;
	
	public Dao() {
		sqlMap = AppSqlConfig.getSqlMapInstance();
		
		//dtZone = DateTimeZone.forTimeZone(country.getTimeZone());
	}
	
	public void createToken(Token token) {
		try {
			deleteToken(token.getToken());
			sqlMap.insert("insertToken", token);
		} catch (SQLException e) {
			log.error("Error al insertar token: "+(token!=null?token.getToken():"[NULL]"), e);
		}
	}
	
	public void renewToken(String oldToken, Token token) {
		deleteToken(oldToken);
		createToken(token);
	}
	
	public void deleteToken(String token) {
		try {
			sqlMap.delete("deleteToken", token);
		} catch (SQLException e) {
			log.error("Error al borrar datos", e);
		}
	}
	
	public void deleteOtherTokens(Token token) {
		try {
			sqlMap.delete("deleteOtherTokens", token);
		} catch (SQLException e) {
			log.error("Error al borrar datos", e);
		}
	}
	
	public Token getToken(String token) {
		try {
			return (Token)sqlMap.queryForObject("selectToken", token);
		} catch (SQLException e) {
			log.error("Error al obtener datos", e);
			return null;
		}
	}
	
	public Usuario getUserByLogin(String login) {
		Map<String,String> p = new HashMap<String,String>();
		p.put("login", login);
		try {
			Usuario usuario = (Usuario)sqlMap.queryForObject("getUserByLogin",p);
			return usuario;
		} catch (SQLException e) {
			log.error("Error al obtener usuario");
			return null;
		}
	}

	public Usuario getUserById(String userId) {
		try {
			Usuario user = (Usuario)sqlMap.queryForObject("getUserById", userId);
			return user;
		} catch (SQLException e) {
			log.error("Error al consultar usuario", e);
			return null;
		}
	}
	
	public boolean validarRut(String rut) {

		boolean validacion = false;
		try {
			rut =  rut.toUpperCase();
			rut = rut.replace(".", "");
			rut = rut.replace("-", "");
			int rutAux = Integer.parseInt(rut.substring(0, rut.length() - 1));
	
			char dv = rut.charAt(rut.length() - 1);
	
			int m = 0, s = 1;
			for (; rutAux != 0; rutAux /= 10) {
				s = (s + rutAux % 10 * (9 - m++ % 6)) % 11;
			}
			if (dv == (char) (s != 0 ? s + 47 : 75)) {
				validacion = true;
			}
		} catch (java.lang.NumberFormatException e) {
		} catch (Exception e) {}
		return validacion;
	}

	public Integer getTotalRows() {
		try {
			return (Integer) sqlMap.queryForObject("getTotalRows");
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}
	}

	@SuppressWarnings("unchecked")
	public Map<String, String> getParametros() {
		Map<String, String> ret = new HashMap<String, String>();
		try {
			List<Map<String, String>> params = (List<Map<String, String>>)sqlMap.queryForList("getParametros");
			if(params!=null) {
				params.stream().forEach(par -> {
					ret.put(par.get("nombre"), par.get("valor"));
				});
			}
			return ret;
		}catch(SQLException e) {
			log.error("Error al leer parametros", e);
			return null;
		}
	}
	
	private static int getDiasHabiles(Date fecIni, Date fecFin) {
		Calendar startCal = Calendar.getInstance();
		startCal.setTime(fecIni);
		Calendar endCal = Calendar.getInstance();
		endCal.setTime(fecFin);
		
		int workDays = 0;
		if(startCal.getTimeInMillis() < endCal.getTimeInMillis()) {
			do {
			    if (startCal.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY && startCal.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
			        ++workDays;
			    }
			    startCal.add(Calendar.DAY_OF_MONTH, 1);
			} while (startCal.getTimeInMillis() < endCal.getTimeInMillis());
		}
		return workDays;
	}
	
//	private Date getLocalDatetime(Timestamp date) {
//		DateTime dt = new DateTime(date);
//		DateTime dtus = dt.withZone(dtZone);
//		return dtus.toLocalDateTime().toDate();
//	}
	
	public Date addDiasHabiles(Date fec, int dias) {
		Calendar c = Calendar.getInstance();
		c.setTime(fec);
		int i=0;
		while (i<dias) {
			c.add(Calendar.DATE, 1);
			if (c.get(Calendar.DAY_OF_WEEK) != 7 && c.get(Calendar.DAY_OF_WEEK) != 1) i++;  
		}
		return c.getTime();
	}
	
	public void resetPassword(Usuario usuario) throws SQLException {
		sqlMap.update("resetPassword", usuario);
	}
	
	public void saveUser(Usuario user, String mode, Usuario usuario) throws SQLException {
		if(mode.equals("I")) {
			sqlMap.insert("insertUser", usuario);
		}else {
			sqlMap.update("updateUser", usuario);
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<Usuario> getUsers() {
		try {
			return (List<Usuario>)sqlMap.queryForList("getUsers");
		} catch (SQLException e) {
			log.error("Error al leer usuarios", e);
			return null;
		}
	}
	
	public void deleteUser(Usuario user, String id) throws SQLException {
		sqlMap.delete("deleteUser", id);
	}
	
	/*
	public void insertNotificationAWS(NotificationAWS notification) {
		try {
			sqlMap.insert("insertNotificationAWS", notification);
			if(notification.getFormId() != null) {
				Form form = getFormCoreById(notification.getFormId());
				if(form != null && Form.StatusMail.SENT.equals(form.getStatusMail())) {
//					CDIDeclaracion declaration = (CDIDeclaracion)form.getRecipient().getRequest();
//					if(notification.getType().equals("Delivery")) {
//						form.setStatusMail(CDIForm.StatusMail.RECEIVED);
//						updateCDIDeclarationNotifRec(declaration);
//					} else if(notification.getType().equals("Bounce")) {
//						form.setStatusMail(CDIForm.StatusMail.BOUNCED);
//						updateCDIDeclarationNotifBounce(declaration);
//					} else if(notification.getType().equals("Complaint")) {
//						form.setStatusMail(CDIForm.StatusMail.COMPLAINT);
//						updateCDIDeclarationNotifComp(declaration);
//					}
					if(notification.getType().equals("Delivery")) {
						form.setStatusMail(Form.StatusMail.RECEIVED);
					} else if(notification.getType().equals("Bounce")) {
						form.setStatusMail(Form.StatusMail.BOUNCED);
					} else if(notification.getType().equals("Complaint")) {
						form.setStatusMail(Form.StatusMail.COMPLAINT);
					}
					updateFormStatusMail(form);
				}
			}
		} catch (SQLException e) {
			throw new HTGException("Error al insert notification", e);
		}
	}
	*/

	@SuppressWarnings("unchecked")
	public List<Turno> getTurnosActivosController(String userId) {
		try {
			return (List<Turno>)sqlMap.queryForList("getTurnosActivosController", userId);
		} catch (SQLException e) {
			log.error("Error al leer usuarios", e);
			return null;
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<Molino> getMolinos(Map<String, String> params) {
		try {
			return (List<Molino>)sqlMap.queryForList("getMolinos", params);
		} catch (SQLException e) {
			log.error("Error al leer molinos", e);
			return null;
		}
	}
	
	public void saveMolino(Usuario user, Molino molino) throws SQLException {
		if(molino.getFaena() != null && molino.getFaena().getClient() != null) {
			try {
				Cliente cliente = molino.getFaena().getClient();
				Calendar c = Calendar.getInstance(TimeZone.getDefault());
				Date date = c.getTime();
				Timestamp fecha = new Timestamp(date.getTime());
				
				sqlMap.startTransaction();
				if(cliente.getId() == null) {
					cliente.setId(UUID.randomUUID().toString());
					cliente.setCreationDate(fecha);
					sqlMap.insert("insertClient", cliente);
				}else {
					sqlMap.update("updateClient", cliente);
				}
				
				Faena faena = molino.getFaena();
				if(faena.getId() == null) {
					faena.setId(UUID.randomUUID().toString());
					faena.setCreationDate(fecha);
					sqlMap.insert("insertFaena", faena);
				}else {
					sqlMap.update("updateFaena", faena);
				}
				
				if(molino.getId() == null) {
					molino.setId(UUID.randomUUID().toString());
					molino.setCreationDate(fecha);
					molino.setStatusAdmin(StatusAdmin.ACTIVE);
					molino.setCreateUser(user.getName());
					sqlMap.insert("insertMolino", molino);
					
					if(molino.getParts() != null) {
						for(Parte part : molino.getParts()) {
							part.setId(UUID.randomUUID().toString());
							part.setCreationDate(fecha);
							part.setMolinoId(molino.getId());
							sqlMap.insert("insertParte", part);
						}
					}
					
					if(molino.getTurns() != null) {
						for(Turno turno : molino.getTurns()) {
							turno.setId(UUID.randomUUID().toString());
							turno.setCreationDate(fecha);
							turno.setMolino(molino);
							sqlMap.insert("insertTurno", turno);
							
							if(turno.getPersonas() != null) {
								for(Persona persona : turno.getPersonas()) {
									persona.setTurnoId(turno.getId());
									sqlMap.insert("insertPersonaTurno", persona);
								}
							}
						}
					}
				}else {
					sqlMap.insert("updateMolinoAttr", molino);
					Molino _molino = getMolinoById(molino.getId());
					if(molino.getTurns() != null) {
						for(Turno turno : molino.getTurns()) {
							Turno _turno = existeTurno(turno, _molino.getTurns());
							if(_turno == null) {
								turno.setId(UUID.randomUUID().toString());
								turno.setCreationDate(fecha);
								turno.setMolino(molino);
								sqlMap.insert("insertTurno", turno);
							}else {
								turno.setId(_turno.getId());
								sqlMap.delete("deletePersonasTurno", _turno.getId());
							}
							
							if(turno.getPersonas() != null) {
								for(Persona persona : turno.getPersonas()) {
									persona.setTurnoId(turno.getId());
									sqlMap.insert("insertPersonaTurno", persona);
								}
							}
						}
					}
					if(_molino.getTurns() != null) {
						for(Turno turno : _molino.getTurns()) {
							Turno _turno = existeTurno(turno, molino.getTurns());
							if(_turno == null) {
								sqlMap.delete("deleteTurno", turno.getId());
							}
						}
					}
					
					if(molino.getParts() != null) {
						for(Parte part : molino.getParts()) {
							if(part.getId() == null) {
								part.setId(UUID.randomUUID().toString());
								part.setCreationDate(fecha);
								part.setMolinoId(molino.getId());
								sqlMap.insert("insertParte", part);
							}else {
								sqlMap.update("updateQtyParte", part);
							}
						}
					}
					if(_molino.getParts() != null) {
						for(Parte parte : _molino.getParts()) {
							Parte _parte = existeParte(parte, molino.getParts());
							if(_parte == null) {
								sqlMap.delete("deleteParte", parte.getId());
							}
						}
					}
				}
				
				sqlMap.commitTransaction();
			} catch (SQLException e) {
				throw e;
			} finally {
				try {sqlMap.endTransaction();}catch(Exception e){}
			}
		}
	}
	
	private Turno existeTurno(Turno turno, List<Turno> turnos) {
		if(turnos != null) {
			for(Turno t : turnos) {
				if(t.getName().equals(turno.getName())) return t;
			}
		}
		return null;
	}
	
	private Parte existeParte(Parte parte, List<Parte> partes) {
		if(partes != null) {
			for(Parte p : partes) {
				if(parte.getId().equals(p.getId())) return p;
			}
		}
		return null;
	}
	
	public Turno getTurnoById(String id) {
		try {
			return (Turno)sqlMap.queryForObject("getTurnoById", id);
		} catch (SQLException e) {
			log.error("Error al leer turno", e);
			return null;
		}
	}
	
	public void inicioTurno(Usuario user, Turno turno) throws SQLException {
		try {
			sqlMap.startTransaction();

			turno.setStatus(Turno.Status.OPEN);

			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			Timestamp fecha = new Timestamp(date.getTime());
			
			Map<String, Object> params = new HashMap<String, Object>();
			String id = UUID.randomUUID().toString();
			
			turno.setTurnoId(id);
			params.put("id", id);
			params.put("turno", turno);
			params.put("fecha", fecha);
			sqlMap.update("updateStatusTurno", turno);
			sqlMap.insert("insertTurnoHistorial", params);
			if(turno.getMolino().getStatus() == null) {
				turno.getMolino().setStatus(Molino.Status.STARTED);
				if(turno.getMolino().getStages().size() == 0) {
					insertEtapa(user, fecha, turno, Etapa.EtapaEnum.BEGINNING);
					
					turno.getMolino().setStage(Etapa.EtapaEnum.BEGINNING);
				}
				sqlMap.update("updateStatusMolino", turno.getMolino());
			}
			
			sqlMap.commitTransaction();
		} catch (SQLException e) {
			throw e;
		} finally {
			try {sqlMap.endTransaction();}catch(Exception e){}
		}
	}
	
	public void finTurno(Usuario user, Turno turno) throws SQLException {
		try {
			sqlMap.startTransaction();

			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("turnoId", turno.getTurnoId());
			params.put("fecha", new Timestamp(date.getTime()));
			sqlMap.insert("finTurnoHistorial", params);

			turno.setStatus(Turno.Status.CLOSED);
			turno.setTurnoId(null);
			sqlMap.update("updateStatusTurno", turno);
			
			sqlMap.commitTransaction();
		} catch (SQLException e) {
			throw e;
		} finally {
			try {sqlMap.endTransaction();}catch(Exception e){}
		}
	}

	@SuppressWarnings("unchecked")
	public List<TareaParte> getPartesByTarea(String id) {
		try {
			return (List<TareaParte>)sqlMap.queryForList("getPartesByTarea", id);
		} catch (SQLException e) {
			log.error("Error al leer datos", e);
			return null;
		}
	}
	
	public Molino getMolinoById(String id) {
		try {
			return (Molino)sqlMap.queryForObject("getMolinoById", id);
		} catch (SQLException e) {
			log.error("Error al leer molino", e);
			return null;
		}
	}
	
	public void startTask(Usuario user, Turno turno, Etapa.EtapaEnum stage) throws SQLException {
		Molino molino = turno.getMolino();
		Etapa etapa = null;
		if(turno.getMolino().getStages() != null) {
			for(Etapa et : turno.getMolino().getStages()) {
				if(et.getStage().equals(stage)) etapa = et;
			}
		}
		Tarea.TareaEnum task = molino.getNextTask(etapa);
		if(task != null) {
			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			
			Tarea tarea = new Tarea();
			tarea.setId(UUID.randomUUID().toString());
			tarea.setCreationDate(new Timestamp(date.getTime()));
			tarea.setTask(task);
			tarea.setUserStart(user.getLogin());
			
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("etapa", etapa);
			params.put("tarea", tarea);
			params.put("turnoId", turno.getTurnoId());

			sqlMap.insert("insertTarea", params);

			molino.setUpdateDate(new Timestamp(date.getTime()));
			molino.setUpdateUser(user.getLogin());
			sqlMap.update("updateMolino", molino);
			
			if(task.equals(Tarea.TareaEnum.LIMPIEZA)) {
				turno = getTurnoById(turno.getId());
				startTask(user, turno, stage);
			}else if(task.equals(Tarea.TareaEnum.GIRO)) {
				sqlMap.update("updateGiro", molino.getId());
			}
		}
	}
	
	private void finishEtapa(Usuario user, Etapa etapa, Turno turno, Timestamp finishDate) throws SQLException {
		TurnoHistorial t = new TurnoHistorial();
		t.setId(turno.getTurnoId());
		
		etapa.setTurnoFinish(t);
		etapa.setStatus(Etapa.Status.FINISHED);
		etapa.setFinishDate(finishDate);
		etapa.setUserFinish(user.getLogin());
		sqlMap.update("finishEtapa", etapa);
		
		Molino molino = turno.getMolino();
		molino.setUpdateDate(finishDate);
		molino.setUpdateUser(user.getLogin());
		sqlMap.update("updateMolino", molino);
	}
	
	private void finishTarea(Turno turno, Etapa etapa, Tarea task, Usuario user) throws SQLException {
		task.setUserFinish(user.getLogin());
		TurnoHistorial t = new TurnoHistorial();
		t.setId(turno.getTurnoId());
		task.setTurnoFinish(t);
		
		sqlMap.update("finishTarea", task);
		
		Molino molino = turno.getMolino();
		Tarea.TareaEnum next = molino.getNextTask(etapa);
		if(next == null) {
			finishEtapa(user, etapa, turno, task.getFinishDate());
		}
	}
	
	public void finishTask(Usuario user, Turno turno, Etapa.EtapaEnum stage) throws SQLException {
		try {
			sqlMap.startTransaction();
			
			Etapa etapa = null;
			if(turno.getMolino().getStages() != null) {
				for(Etapa et : turno.getMolino().getStages()) {
					if(et.getStage().equals(stage)) etapa = et;
				}
			}
			if(etapa != null) {
				Tarea task = etapa.getCurrentTask();
				if(task != null && task.getFinishDate() == null) {
					Calendar c = Calendar.getInstance(TimeZone.getDefault());
					Date date = c.getTime();
					Timestamp fecha = new Timestamp(date.getTime());
					
					task.setFinishDate(fecha);
					finishTarea(turno, etapa, task, user);
					
					Molino molino = turno.getMolino();
					molino.setUpdateDate(new Timestamp(date.getTime()));
					molino.setUpdateUser(user.getLogin());
					sqlMap.update("updateMolino", molino);
				}
			}
			
			sqlMap.commitTransaction();
		} catch (SQLException e) {
			throw e;
		} finally {
			try {sqlMap.endTransaction();}catch(Exception e){}
		}
	}
	
	private Etapa insertEtapa(Usuario user, Timestamp fecha, Turno turno, Etapa.EtapaEnum stage) throws SQLException {
		Map<String, Object> params = new HashMap<String, Object>();
		Etapa etapa = new Etapa();
		etapa.setId(UUID.randomUUID().toString());
		etapa.setCreationDate(fecha);
		etapa.setStage(stage);
		etapa.setStatus(Etapa.Status.STARTED);
		etapa.setUserStart(user.getLogin());
		params.put("molino", turno.getMolino());
		params.put("etapa", etapa);
		params.put("turnoId", turno.getTurnoId());
		sqlMap.insert("insertEtapa", params);
		
		Molino molino = turno.getMolino();
		molino.setUpdateDate(fecha);
		molino.setUpdateUser(user.getLogin());
		sqlMap.update("updateMolino", molino);
		
		return etapa;
	}
	
	public void finishEtapa(Usuario user, Turno turno) throws SQLException {
		try {
			sqlMap.startTransaction();

			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			Timestamp fecha = new Timestamp(date.getTime());
			
			Etapa etapa = turno.getMolino().getCurrentStage();
			finishEtapa(user, etapa, turno, fecha);
			
			sqlMap.commitTransaction();
		} catch (SQLException e) {
			throw e;
		} finally {
			try {sqlMap.endTransaction();}catch(Exception e){}
		}
	}
	
	public void startEtapa(Usuario user, Turno turno) throws SQLException {
		try {
			sqlMap.startTransaction();

			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			Timestamp fecha = new Timestamp(date.getTime());
			
			if(Etapa.EtapaEnum.BEGINNING.equals(turno.getMolino().getStage()) && turno.getMolino().getStages().size() == 1) {
				insertEtapa(user, fecha, turno, Etapa.EtapaEnum.EXECUTION);
				
				turno.getMolino().setStage(Etapa.EtapaEnum.EXECUTION);
				sqlMap.update("updateStatusMolino", turno.getMolino());
			}else if(Etapa.EtapaEnum.EXECUTION.equals(turno.getMolino().getStage())) {
				Etapa etapa = turno.getMolino().getCurrentStage();
				if(etapa.getFinishDate() != null) {
					insertEtapa(user, fecha, turno, Etapa.EtapaEnum.FINISHED);

					turno.getMolino().setStage(Etapa.EtapaEnum.FINISHED);
					sqlMap.update("updateStatusMolino", turno.getMolino());
				}
			}else if(Etapa.EtapaEnum.FINISHED.equals(turno.getMolino().getStage())) {
				Etapa etapa = turno.getMolino().getCurrentStage();
				if(etapa.getFinishDate() != null) {
					etapa = insertEtapa(user, fecha, turno, Etapa.EtapaEnum.DELIVERY);
					finishEtapa(user, etapa, turno, fecha);
					
					turno.getMolino().setStage(Etapa.EtapaEnum.DELIVERY);
					turno.getMolino().setStatus(Molino.Status.FINISHED);
					turno.getMolino().setFinishDate(fecha);
					sqlMap.update("updateStatusMolino", turno.getMolino());
				}
			}
			
			sqlMap.commitTransaction();
		} catch (SQLException e) {
			throw e;
		} finally {
			try {sqlMap.endTransaction();}catch(Exception e){}
		}
	}
	
	public void addParte(Usuario user, Turno turno, Tarea.TareaEnum task, String parteId, int cant) throws SQLException {
		try {
			sqlMap.startTransaction();

			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			Timestamp fecha = new Timestamp(date.getTime());
			
			if(Etapa.EtapaEnum.EXECUTION.equals(turno.getMolino().getStage())) {
				Etapa etapa = turno.getMolino().getCurrentStage();
				if(etapa.getFinishDate() == null) {
					Parte parte = null;
					for(Parte p : turno.getMolino().getParts()) {
						if(p.getId().equals(parteId)) {
							parte = p;
							break;
						}
					}

					Tarea tarea = null;
					for(Tarea t : etapa.getTasks()) {
						if(t.getTask().equals(task)) {
							tarea = t;
						}
					}
					if(parte != null && tarea != null) {
						boolean success = false;
						if(task.equals(Tarea.TareaEnum.BOTADO) && parte.getQty() >= (parte.getTotalBotadas() + cant)) {
							success = true;
							parte.setBotadas(parte.getBotadas()+cant);
							parte.setTotalBotadas(parte.getTotalBotadas()+cant);
						}else if(task.equals(Tarea.TareaEnum.LIMPIEZA) && parte.getBotadas() >= (parte.getLimpiadas() + cant)) {
							success = true;
							parte.setLimpiadas(parte.getLimpiadas()+cant);
							parte.setTotalLimpiadas(parte.getTotalLimpiadas()+cant);
							
							if(turno.getMolino().getBotadas() == turno.getMolino().getLimpiadas()) {
								tarea.setFinishDate(fecha);
								tarea.setUserFinish(user.getLogin());
							}
						}else if(task.equals(Tarea.TareaEnum.MONTAJE) && parte.getTotalLimpiadas() >= (parte.getTotalMontadas() + cant)) {
							success = true;
							parte.setMontadas(parte.getMontadas()+cant);
							parte.setTotalMontadas(parte.getTotalMontadas()+cant);
							
							if(turno.getMolino().getTotalBotadas() == turno.getMolino().getTotalMontadas()) {
								tarea.setFinishDate(fecha);
								tarea.setUserFinish(user.getLogin());
							}
						}
						if(success) {
							if(tarea.getFinishDate() != null) finishTarea(turno, etapa, tarea, user);
							
							sqlMap.update("updatePartes", parte);
							
							TurnoHistorial t = new TurnoHistorial();
							t.setId(turno.getTurnoId());
							
							TareaParte tParte = new TareaParte();
							tParte.setId(UUID.randomUUID().toString());
							tParte.setCreationDate(fecha);
							tParte.setPart(parte);
							tParte.setQty(cant);
							tParte.setTurno(t);
							tParte.setUser(user.getLogin());
							tParte.setTareaId(tarea.getId());
							
							sqlMap.insert("insertTareaParte", tParte);
							
							Molino molino = turno.getMolino();
							molino.setUpdateDate(fecha);
							molino.setUpdateUser(user.getLogin());
							sqlMap.update("updateMolino", molino);
						}
					}
				}
			}
			
			sqlMap.commitTransaction();
		} catch (SQLException e) {
			throw e;
		} finally {
			try {sqlMap.endTransaction();}catch(Exception e){}
		}
	}
	
	public void startInterruption(Usuario user, Turno turno, String desc) throws SQLException {
		Molino molino = turno.getMolino();

		Etapa current = molino.getCurrentStage();
		if(!current.getHasInterruption()) {
			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			
			Map<String, Object> params = new HashMap<String, Object>();
	
			Evento evt = new Evento();
			evt.setStartDate(new Timestamp(date.getTime()));
			evt.setType(Evento.Type.INTERRUPTION);
			evt.setComments(desc);
			evt.setUserStart(user.getLogin());
			params.put("evt", evt);
			params.put("stage", current);
	
			sqlMap.insert("insertInterruption", params);
		}
	}
	
	public void finishInterruption(Usuario user, Turno turno) throws SQLException {
		Molino molino = turno.getMolino();
		Etapa current = molino.getCurrentStage();
		if(current.getHasInterruption()) {
			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			
			for(Evento evt : current.getEvents()) {
				if(evt.getType().equals(Evento.Type.INTERRUPTION) && evt.getFinishDate() == null) {
					evt.setFinishDate(new Timestamp(date.getTime()));
					evt.setUserFinish(user.getLogin());
					sqlMap.insert("finishInterruption", evt);
				}
			}
		}
	}
	
}