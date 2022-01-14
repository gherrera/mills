package com.htg.mills.controller;

import java.io.IOException;
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.htg.mills.app.ApiApp;
import com.htg.mills.app.App;
import com.htg.mills.entities.CurrentUser;
import com.htg.mills.entities.Results;
import com.htg.mills.entities.Usuario;
import com.htg.mills.entities.maintenance.Etapa;
import com.htg.mills.entities.maintenance.Tarea;
import com.htg.mills.entities.maintenance.Turno;
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

	@PostMapping("inicioTurno")
    @ResponseBody Turno inicioTurno(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.inicioTurno(currentUser.getUser(), params.get("id"));
	}
	
	@PostMapping("getTurno")
    @ResponseBody Turno getTurno(@RequestBody Map<String, String> params) {
		return app.getTurnoById(params.get("id"));
	}
	
	@PostMapping("finTurno")
    @ResponseBody Turno finTurno(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finTurno(currentUser.getUser(), params.get("id"));
	}
	
	@PostMapping("startTask")
    @ResponseBody Turno startTask(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.startTask(currentUser.getUser(), params.get("id"), Etapa.EtapaEnum.valueOf(params.get("stage")));
	}
	
	@PostMapping("finishTask")
    @ResponseBody Turno finishTask(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finishTask(currentUser.getUser(), params.get("id"), Etapa.EtapaEnum.valueOf(params.get("stage")));
	}
	
	@PostMapping("startEtapa")
    @ResponseBody Turno startEtapa(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.startEtapa(currentUser.getUser(), params.get("id"));
	}
	
	@PostMapping("finishEtapa")
    @ResponseBody Turno finishEtapa(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finishEtapa(currentUser.getUser(), params.get("id"));
	}
	
	@PostMapping("addParte")
    @ResponseBody Turno addParte(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.addParte(currentUser.getUser(), params.get("id"), Tarea.TareaEnum.valueOf(params.get("stage")), params.get("parteId"), 1);
	}
	
	@PostMapping("startInterruption")
    @ResponseBody Turno startInterruption(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.startInterruption(currentUser.getUser(), params.get("id"), params.get("desc"));
	}
	
	@PostMapping("finishInterruption")
    @ResponseBody Turno finishInterruption(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finishInterruption(currentUser.getUser(), params.get("id"));
	}
	
}
