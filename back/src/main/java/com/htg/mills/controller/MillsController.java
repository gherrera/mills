package com.htg.mills.controller;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.htg.mills.app.ApiApp;
import com.htg.mills.app.App;
import com.htg.mills.entities.CurrentUser;
import com.htg.mills.entities.Results;
import com.htg.mills.entities.ScheduleStatus;
import com.htg.mills.entities.Usuario;
import com.htg.mills.entities.maintenance.Activity;
import com.htg.mills.entities.maintenance.Cliente;
import com.htg.mills.entities.maintenance.Etapa;
import com.htg.mills.entities.maintenance.Evento;
import com.htg.mills.entities.maintenance.Molino;
import com.htg.mills.entities.maintenance.Tarea;
import com.htg.mills.entities.maintenance.TareaParte;
import com.htg.mills.entities.maintenance.Turno;
import com.htg.mills.entities.maintenance.TurnoHistorial;
import com.htg.mills.exceptions.HTGException;
import com.htg.mills.security.JwtRequest;
import com.htg.mills.security.JwtResponse;
import com.htg.mills.security.JwtTokenUtil;
import com.htg.mills.security.LoginAttemptService;
import com.htg.mills.security.TokenBasedAuthentication;
import com.htg.mills.utils.Security;

@RestController
@EnableAutoConfiguration
@RequestMapping("api")
public class MillsController {

	public static Format formatterDate = new SimpleDateFormat("yyyyMMdd");

	private static Logger log = LogManager.getLogger(MillsController.class);

	@Autowired
	private App app;
	
	@Autowired
	private ApiApp apiApp;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;
	
	@Autowired
    private LoginAttemptService loginAttemptService;
	
	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private ExcelController excelController;
	
	@PostMapping("authenticate")
	public ResponseEntity<?> createAuthenticationToken(HttpServletRequest request, @RequestBody JwtRequest authenticationRequest) throws Exception {
		try {
			Authentication auth = authenticate(authenticationRequest.getUsername(), authenticationRequest.getPassword());
			if(auth != null && auth.getPrincipal() instanceof CurrentUser) {
				CurrentUser currentUser = (CurrentUser)auth.getPrincipal();
				Usuario user = currentUser.getUser();
				
				String token = jwtTokenUtil.generateToken(currentUser);
				Date expirationDate = new Date(authenticationRequest.getTime() + currentUser.getTimeout() * 1000);
				JwtResponse response = new JwtResponse(token);
				response.setExpirationDate(expirationDate);
				response.setTimeout(currentUser.getTimeout());
				
				app.createToken(user, currentUser.getMaxSessions(), token, expirationDate);
		        loginAttemptService.loginSucceeded(currentUser.getUsername());
		        
				return ResponseEntity.ok(response);
			}else {
				return ResponseEntity.ok(new JwtResponse("ERROR", 401, "Bad Credentials"));
			}
		}catch(HTGException e) {
			String username = authenticationRequest.getUsername();
			boolean lockedBefore = loginAttemptService.isBlocked(username);
			if(!lockedBefore) {
				loginAttemptService.loginFailed(username);
				boolean lockedAfter = loginAttemptService.isBlocked(username);
				Usuario user = app.getUserByLogin(username);
				if(user != null) {
					if(lockedAfter) {
						//app.insertRegistroMovimiento(user, Movimiento.Type.SESSION_ERROR, "Usuario bloqueado por intentos fallidos", null, null);
					}else {
						//app.insertRegistroMovimiento(user, Movimiento.Type.SESSION_ERROR, "Usuario y/o clave incorrectos", null, null);
					}
				}
			}
			return ResponseEntity.ok(new JwtResponse("ERROR", 401, e.getMessage()));
		}
	}
	
	private Authentication authenticate(String username, String password) throws Exception {
		try {
			return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		} catch (DisabledException e) {
			throw new HTGException("USER_DISABLED", e);
		} catch (BadCredentialsException e) {
			throw new HTGException("INVALID_CREDENTIALS", e);
		} catch (LockedException e) {
			throw new HTGException("USER_LOCKED", e);
		} catch (Exception e) {
			throw new HTGException("ERROR", e);
		}
	}
	
	 @PostMapping("logout")
    public ResponseEntity<String> logout(){
    	TokenBasedAuthentication authentication = (TokenBasedAuthentication)SecurityContextHolder.getContext().getAuthentication();
    	//CurrentUser currentUser = (CurrentUser)authentication.getPrincipal();

    	app.deleteToken(authentication.getToken());
    	
    	return ResponseEntity.ok("success");
    }
	 
	@PostMapping("refreshToken")
	public ResponseEntity<?> refreshToken(@RequestBody JwtRequest authenticationRequest) throws Exception {
    	TokenBasedAuthentication authentication = (TokenBasedAuthentication)SecurityContextHolder.getContext().getAuthentication();
    	CurrentUser currentUser = (CurrentUser)authentication.getPrincipal();

    	String token = jwtTokenUtil.generateToken(currentUser);
    	Date expirationDate = new Date(authenticationRequest.getTime() + currentUser.getTimeout() * 1000);
    	JwtResponse response = new JwtResponse(token);
		response.setExpirationDate(expirationDate);
        
		app.renewToken(authentication.getToken(), currentUser.getUser(), token, expirationDate);
		
		return ResponseEntity.ok(response);
    }
	
	@PostMapping("currentUser")
    public ResponseEntity<Map<String, Object>> currentUser(){
    	CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    	Map<String, Object> params = new HashMap<String, Object>();
		params.put("user", currentUser.getUser());
        return ResponseEntity.ok(params);
    }
	
	@PostMapping("changePwd")
	@ResponseBody
	public Map<String, String> changePwd(@RequestBody Map<String, String> user) throws JSONException {
		Map<String, String> json = new HashMap<String, String>();
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		CurrentUser currentUser = (CurrentUser)principal;
		String userId = currentUser.getId();

		String password = user.get("password");
		String newPwd = user.get("newpwd");
		Usuario u = app.getUserById(userId);
	
		json.put("status", "ERROR");
		json.put("msg", "NOT_AUTHORIZED");
		
		if(password == null || Security.getSha256Value(password).equals(u.getPassword())
		) {
			try {
				if(app.changePwd(currentUser.getUser(), currentUser.getUser(), newPwd)) {
					json.put("status", "OK");
					json.put("msg", null);
				}
			}catch(HTGException e) {
				json.put("detail", e.getMessage());
			}
		}else {
			json.put("msg", "BAD_CREDENTIALS");
			json.put("detail", "BAD_CREDENTIALS");
		}
		return json;
	}
	
	@RequestMapping("forgotPwd")
	public Usuario forgotPwd(@RequestBody Map<String, String> user) {
		Usuario usuario = app.getUserByLogin(user.get("username"));
		if(usuario != null) {
			app.resetPassword(usuario);
		}
		return usuario;
	}
	
	@PostMapping("saveUser/{mode}")
	@ResponseBody
	public ResponseEntity<String> saveUser(@PathVariable("mode") String mode, @RequestBody Usuario user) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		
		try {
			app.saveUser(currentUser.getUser(), mode, user);
			return ResponseEntity.ok("success");
		}catch(Exception e){
			return ResponseEntity.ok("error: "+e.getMessage());
		}
	}
	
	@RequestMapping(value = "error401")
	public Map<String, String> error401(HttpServletRequest request, HttpServletResponse response) {
		Map<String, String> ret = new HashMap<String, String>();
		ret.put("status", "ERROR");
		String message = "Acceso no permitido";
		if(request.getAttribute("message") != null && request.getAttribute("message") instanceof String) {
			message = (String)request.getAttribute("message");
		}
		ret.put("message", message);
		return ret;
	}
	
	@PostMapping("users")
    @ResponseBody
	public Results users() {
		//CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.getUsers();
	}
	
	@PostMapping("clients")
    @ResponseBody
	public List<Cliente> clients() {
		return app.getClientes();
	}
	
	@PostMapping("deleteUser")
    @ResponseBody
    public String deleteUser(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		try {
			app.deleteUser(currentUser.getUser(), params.get("id"));
			return "OK";
		}catch(Exception e) {
			log.error("Error al borrar usuario", e);
			return "ERROR";
		}
	}
	
	@RequestMapping(value = "sns/notificationAWS", method=RequestMethod.POST)
	public String notificationAWS(HttpServletResponse response, @RequestBody String jsonString) throws IOException {
		try {
			response.getWriter().print(apiApp.insertNotificationAWS(jsonString));
		} catch (Exception e) {
			response.getWriter().print("ERROR");
			log.error("Error al procesar json: "+jsonString, e);
		}
	    response.getWriter().flush();
	    return null;
	}

	@PostMapping("getTurnosActivosController")
    @ResponseBody
	public List<Turno> getTurnosActivosController() {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		List<Turno> turnos = app.getTurnosActivosController(currentUser.getUser().getId());
		return turnos;
	}
	
	@PostMapping("getMolinos")
    @ResponseBody
	public List<Molino> getMolinos(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.getMolinos(currentUser.getUser().getId(), params);
	}

	@PostMapping("getMolino")
    @ResponseBody
	public Molino getMolino(@RequestBody Map<String, String> params) {
		return app.getMolinoById(params.get("id"));
	}
	
	@PostMapping("saveMolino")
    @ResponseBody Molino saveMolino(@RequestBody Molino molino) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.saveMolino(currentUser.getUser(), molino);
	}
	
	@PostMapping("getTurno")
    @ResponseBody Turno getTurno(@RequestBody Map<String, String> params) {
		return app.getTurnoById(params.get("id"));
	}
	
	@PostMapping("getTiposEquipo")
    @ResponseBody
	public List<Map<String, Object>> getTiposEquipo() {
		return app.getTiposEquipo();
	}

	@PostMapping("reportTiposEquipo")
	public ModelAndView reportTiposEquipo() {
		List<Map<String, Object>> tiposEquipo = app.getTiposEquipo();
		return new ModelAndView(excelController, "tiposEquipo", tiposEquipo);
	}

	@PostMapping("getTiposPieza")
    @ResponseBody
	public List<Map<String, Object>> getTiposPieza() {
		return app.getTiposPieza();
	}

	@PostMapping("reportTiposPieza")
	public ModelAndView reportTiposPieza() {
		List<Map<String, Object>> tiposPieza = app.getTiposPieza();
		return new ModelAndView(excelController, "tiposPieza", tiposPieza);
	}
	
	@PostMapping("getPersonas")
    @ResponseBody
	public List<Map<String, String>> getPersonas() {
		return app.getPersonas();
	}
	
	@PostMapping("reportPersonal")
	public ModelAndView reportPersonal() {
		List<Map<String, String>> personal = app.getPersonas();
		return new ModelAndView(excelController, "personal", personal);
	}
	
	@PostMapping("uploadConfigTiposEquipo")
	@ResponseBody
	public String uploadConfigTiposEquipo(@RequestParam("file") MultipartFile file) {
		String status="OK";
		if(file == null || file.isEmpty()) {
			status = "ERROR: Debe seleccionar un archivo";
		}else {
			CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")+1).toLowerCase();
			File tmp;
			try {
				tmp = File.createTempFile("tiposEquipo", "." + ext);
				file.transferTo(tmp);
				app.uploadConfigTiposEquipo(currentUser.getUser(), tmp);
				tmp.delete();
			} catch (IOException e) {
				status = "ERROR: "+e.getMessage();
			}
		}
		return status;
	}
	
	@PostMapping("uploadConfigTiposPieza")
	@ResponseBody
	public String uploadConfigTiposPieza(@RequestParam("file") MultipartFile file) {
		String status="OK";
		if(file == null || file.isEmpty()) {
			status = "ERROR: Debe seleccionar un archivo";
		}else {
			CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")+1).toLowerCase();
			File tmp;
			try {
				tmp = File.createTempFile("tiposPieza", "." + ext);
				file.transferTo(tmp);
				app.uploadConfigTiposPieza(currentUser.getUser(), tmp);
				tmp.delete();
			} catch (IOException e) {
				status = "ERROR: "+e.getMessage();
			}
		}
		return status;
	}
	
	@PostMapping("uploadConfigPersonal")
	@ResponseBody
	public String uploadConfigPersonal(@RequestParam("file") MultipartFile file) {
		String status="OK";
		if(file == null || file.isEmpty()) {
			status = "ERROR: Debe seleccionar un archivo";
		}else {
			CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")+1).toLowerCase();
			File tmp;
			try {
				tmp = File.createTempFile("personal", "." + ext);
				file.transferTo(tmp);
				app.uploadConfigPersonal(currentUser.getUser(), tmp);
				tmp.delete();
			} catch (IOException e) {
				status = "ERROR: "+e.getMessage();
			}
		}
		return status;
	}
	
	@PostMapping("uploadSchedule")
	@ResponseBody
	public ScheduleStatus uploadSchedule(@RequestParam("file") MultipartFile file) {
		ScheduleStatus results = new ScheduleStatus();
		
		String status="OK";
		if(file == null || file.isEmpty()) {
			status = "ERROR";
			results.setMessage("Debe seleccionar un archivo");
		}else {
			String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".")+1).toLowerCase();
			File tmp;
			try {
				tmp = File.createTempFile("schedule", "." + ext);
				file.transferTo(tmp);
				results.setSheduled(app.transformFileIntoSchedule(tmp));
				tmp.delete();
			} catch (Exception e) {
				status = "ERROR";
				results.setMessage(e.getMessage());
			}
		}
		results.setStatus(status);
		
		return results;
	}
	
	@PostMapping("downloadScheduled")
	public ModelAndView downloadScheduled(@RequestBody Map<String, String> params) {
		Molino molino = app.getMolinoById(params.get("id"));
		return new ModelAndView(excelController, "scheduled", molino.getScheduled());
	}
	
	@PostMapping("updatePartTask")
	@ResponseBody
	public TareaParte updatePartTask(@RequestBody TareaParte tareaParte) {
		return app.updatePartTask(tareaParte);
	}
	
	@PostMapping("updateTask")
	@ResponseBody
	public Tarea updateTask(@RequestBody Tarea tarea) {
		return app.updateTask(tarea);
	}
	
	@PostMapping("updateStage")
	@ResponseBody
	public Etapa updateStage(@RequestBody Etapa etapa) {
		return app.updateStage(etapa);
	}
	
	@PostMapping("updateTurnoHistorial")
	@ResponseBody
	public TurnoHistorial updateTurnoHistorial(@RequestBody TurnoHistorial turno) {
		return app.updateTurnoHistorial(turno);
	}
	
	@PostMapping("updateEvento")
	@ResponseBody
	public Evento updateEvento(@RequestBody Evento evento) {
		return app.updateEvento(evento);
	}
	
	@PostMapping("getActivityByMolino")
	@ResponseBody
	public List<Activity> getActivityByMolino(@RequestBody Molino molino) {
		return app.getActivityByMolino(molino.getId());
	}

	@PostMapping("deleteActivity")
	@ResponseBody
	public String deleteActivity(@RequestBody Map<String, String> params) {
		try {
			CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();

			app.deleteActivity(currentUser.getUser(), params.get("idMolino"), params.get("idActivity"));
			return "OK";
		} catch (SQLException e) {
			log.error("Error al eliminar registro de actividad: " + params.get("idActivity"), e);
			return "ERROR";
		}
	}
}
