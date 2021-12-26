package com.htg.mills.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.htg.mills.entities.ErrorResponse;

@Controller
public class CustomErrorController implements ErrorController {

	private static Logger log = LogManager.getLogger(CustomErrorController.class);

	private static final String PATH = "/error";

	@RequestMapping(value = PATH)
	@ResponseBody
	public ErrorResponse error(HttpServletRequest request, HttpServletResponse response) {
		String msg = null;
		if(response.getStatus() == HttpServletResponse.SC_UNAUTHORIZED) {
			msg = (String)request.getAttribute("message");
		}else if(response.getStatus() == HttpServletResponse.SC_INTERNAL_SERVER_ERROR) {
			Throwable throwable = (Throwable)request.getAttribute("javax.servlet.error.exception");
			if(throwable != null) log.error("Error no controlado: " + throwable.getMessage());
		}
		if(msg == null && request.getAttribute("javax.servlet.error.message") != null && request.getAttribute("javax.servlet.error.message") instanceof String) {
			msg = (String)request.getAttribute("javax.servlet.error.message");
		}
		if(msg == null) msg = "Internal Error";
		return new ErrorResponse(response.getStatus(), msg);
	}

}
