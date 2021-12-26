package com.htg.mills.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.htg.mills.entities.Token;

import io.jsonwebtoken.ExpiredJwtException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

	@Autowired
	private AuthenticationService jwtUserDetailsService;
	
	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	private static Logger log = LogManager.getLogger(JwtRequestFilter.class);

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
		final String requestTokenHeader = request.getHeader(SecurityConstants.TOKEN_HEADER);
		String username = null;
		String jwtToken = null;
		// JWT Token is in the form "Bearer token". Remove Bearer word and get
		// only the Token
		if (requestTokenHeader != null && requestTokenHeader.startsWith(SecurityConstants.TOKEN_PREFIX)) {
			jwtToken = requestTokenHeader.substring(7);
			Token token = jwtUserDetailsService.getToken(jwtToken);
			if(token != null) {
				try {
					username = jwtTokenUtil.getUsernameFromToken(jwtToken);
					// Once we get the token validate it.s
					if (username != null) {
						UserDetails currentUser = jwtUserDetailsService.loadUserByUsername(username);
						// if token is valid configure Spring Security to manually set
						// authentication
						TokenBasedAuthentication authentication = new TokenBasedAuthentication( currentUser );
			            authentication.setToken( jwtToken );
			            
			            SecurityContextHolder.getContext().setAuthentication( authentication );
					}else {
						SecurityContextHolder.clearContext();
						log.error("Usuario no existe");
						request.setAttribute("message", "USER_NOT_EXIST");
					}
				} catch (IllegalArgumentException e) {
					SecurityContextHolder.clearContext();
					log.error("Unable to get JWT Token", e);
					request.setAttribute("message", "Unable to get JWT Token");
				} catch (ExpiredJwtException e) {
					SecurityContextHolder.clearContext();
					//log.error("JWT Token has expired", e);
					request.setAttribute("message", "JWT Token has expired");
				} catch (Exception e) {
					SecurityContextHolder.clearContext();
					log.error("Error al obtener token", e);
					request.setAttribute("message", "BAD_REQUEST");
				}
			}
		} else {
			SecurityContextHolder.clearContext();
		}
		chain.doFilter(request, response);
	}
}
