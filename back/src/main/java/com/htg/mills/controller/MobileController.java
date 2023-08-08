package com.htg.mills.controller;

import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.htg.mills.app.App;
import com.htg.mills.entities.CurrentUser;
import com.htg.mills.entities.maintenance.Etapa;
import com.htg.mills.entities.maintenance.Tarea;
import com.htg.mills.entities.maintenance.Turno;

@RestController
@EnableAutoConfiguration
@RequestMapping("api/mobile")
public class MobileController {
	
	@Autowired
	private App app;
	
	private Date getTimestamp(String stimestamp) {
		Date timestamp = null;
		if(stimestamp != null && !stimestamp.isEmpty()) {
			timestamp = new Date(Long.valueOf(stimestamp));
		}
		return timestamp;
	}
	
	@PostMapping("inicioTurno")
    @ResponseBody Turno inicioTurno(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.inicioTurno(currentUser.getUser(), params.get("id"), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("finTurno")
    @ResponseBody Turno finTurno(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finTurno(currentUser.getUser(), params.get("id"), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("startTask")
    @ResponseBody Turno startTask(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.startTask(currentUser.getUser(), params.get("id"), Etapa.EtapaEnum.valueOf(params.get("stage")), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("finishTask")
    @ResponseBody Turno finishTask(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finishTask(currentUser.getUser(), params.get("id"), Etapa.EtapaEnum.valueOf(params.get("stage")), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("startEtapa")
    @ResponseBody Turno startEtapa(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.startEtapa(currentUser.getUser(), params.get("id"), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("finishEtapa")
    @ResponseBody Turno finishEtapa(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finishEtapa(currentUser.getUser(), params.get("id"), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("addParte")
    @ResponseBody Turno addParte(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.addParte(currentUser.getUser(), params.get("id"), Tarea.TareaEnum.valueOf(params.get("stage")), params.get("parteId"), 1, getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("startInterruption")
    @ResponseBody Turno startInterruption(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.startInterruption(currentUser.getUser(), (String)params.get("id"), Boolean.valueOf(params.get("stopFaena")), (String)params.get("comments"), getTimestamp(params.get("timestamp")));
	}
	
	@PostMapping("finishInterruption")
    @ResponseBody Turno finishInterruption(@RequestBody Map<String, String> params) {
		CurrentUser currentUser = (CurrentUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return app.finishInterruption(currentUser.getUser(), params.get("id"), getTimestamp(params.get("timestamp")));
	}
}
