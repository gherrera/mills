package com.htg.mills.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
		
	@Autowired
	private JwtRequestFilter jwtRequestFilter;
	
	@Autowired
	private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

	@Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

	@Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
            	
        		String corsUrls = System.getenv("cors_urls");
                registry.addMapping("/api/**").allowedOriginPatterns(corsUrls.split(","));
            }
        };
    }
	
	private static final String[] AUTH_WHITELIST = {
            // -- Swagger UI v2
            "/v2/**",
            "/swagger-resources/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/webjars/**"
    };
	
	@Override
    public void configure(WebSecurity web) throws Exception {
		web
        .ignoring()
        .antMatchers(
                "/swagger-resources/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v2/*",
                "/webjars/**"
        		);
	}
	
	@Override
    protected void configure(HttpSecurity http) throws Exception {
  
      http.csrf().disable();
      http.headers().frameOptions().disable()
    	.httpStrictTransportSecurity()
      ;

      http
      	.authorizeRequests()
    	  .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
      	  .antMatchers(AUTH_WHITELIST).permitAll()

      	  .antMatchers("/").permitAll()
      	  .antMatchers("/error**").permitAll()

	      .antMatchers("/api/authenticate").permitAll()
	      .antMatchers("/api/getFormById/**").permitAll()
	      .antMatchers("/api/getDataSourcesCatalogo").permitAll()
	      .antMatchers("/api/getDataSourcesForm/**").permitAll()
	      .antMatchers("/api/saveSectionValues/**").permitAll()
	      .antMatchers("/api/sendForm/**").permitAll()
	      .antMatchers("/api/uploadLogoForm/**").permitAll()
	      .antMatchers("/api/getLogoForm/**").permitAll()
	      .antMatchers("/api/getFormIdHash/**").permitAll()
	      .antMatchers("/api/generateForm/**").permitAll()
	      .antMatchers("/api/getDestinatarioByRut/**").permitAll()
	      .antMatchers("/api/formToPdf/**").permitAll()
	      .antMatchers("/api/getImageClient**").permitAll()
	      .antMatchers("/api/sns/notificationAWS").permitAll()
	      
	      .antMatchers("/api/**").authenticated()		    
		  .antMatchers("/app/rest/**").authenticated()
	    .and()
			// make sure we use stateless session; session won't be used to
			// store user's state.
			.exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
	    ;      

      http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
	}
}
