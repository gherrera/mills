package com.htg.mills.dao;

import java.sql.SQLException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.joda.time.DateTimeZone;

import com.htg.mills.entities.Country;
import com.htg.mills.entities.Token;
import com.htg.mills.entities.Usuario;
import com.ibatis.sqlmap.client.SqlMapClient;

public class Dao {

	private static Logger log = LogManager.getLogger(Dao.class);
	private Map<String, Country> countries = new HashMap<String, Country>();
	private static DateTimeZone dtZone;

	private SqlMapClient sqlMap;
	
	public Dao() {
		sqlMap = AppSqlConfig.getSqlMapInstance();
		
		//dtZone = DateTimeZone.forTimeZone(country.getTimeZone());
	}

	@SuppressWarnings("unchecked")
	public List<Country> getCountries() {
		try {
			return (List<Country>)sqlMap.queryForList("getCountries");
		} catch (SQLException e) {
			log.error("Error al obtener datos de paises", e);
			return null;
		}
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
	
	public Date getDateByCountry(String country) {
		Date currDate;
		try {
			Country _country = countries.get(country);
			Calendar cal = Calendar.getInstance();
			cal.add(Calendar.MILLISECOND, _country.getDiffMiliseconds());
			currDate = cal.getTime();
		} catch (Exception e) {
			currDate = new Date();
		}
		return currDate;
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

}