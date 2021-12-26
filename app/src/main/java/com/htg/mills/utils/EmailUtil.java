package com.htg.mills.utils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.OutputStreamWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.htg.mills.exceptions.HTGException;

import freemarker.cache.FileTemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.Template;

public class EmailUtil {

	private Session session;
	private static Logger log = LogManager.getLogger(EmailUtil.class);
	private static EmailUtil emailInstance = null;
	private boolean useSsl;
	private String host;
	private String from;
	
	private EmailUtil(Properties prop) {
		boolean ssl=false;
		if(prop.getProperty("mail.smtp.ssl") != null && "true".equals(prop.getProperty("mail.smtp.ssl"))) ssl = true;
		boolean debug=false;
		if(prop.getProperty("mail.smtp.debug") != null && "true".equals(prop.getProperty("mail.smtp.debug"))) debug = true;
		init(prop.getProperty("mail.smtp.host"), prop.getProperty("mail.smtp.port"), prop.getProperty("mail.smtp.username"), prop.getProperty("mail.smtp.password"), prop.getProperty("mail.smtp.from"), ssl, debug);
	}
	
	public static synchronized Properties getTlsSmtpProperties(String host, String port, boolean useSmtpAuth, boolean debug) {
		Properties tlsProps = new Properties();
		
		// If you intend to use SSL/TLS, you will want to set the transport to 
		// "smtps" and use the mail.smtps.xxx properties.
		tlsProps.put("mail.smtps.port", port);
		tlsProps.put("mail.smtps.host", host);
		if(debug) tlsProps.put("mail.smtps.debug", "true");
		if(useSmtpAuth) tlsProps.put("mail.smtps.auth", "true");
		else tlsProps.put("mail.smtps.auth", "false");
		tlsProps.put("mail.smtps.ssl.enable", "true");
		//tlsProps.put("mail.smtps.starttls.enable", "true");
		
		tlsProps.put("mail.smtp.socketFactory.port", port);
		tlsProps.put("mail.smtp.socketFactory.fallback", "false");
		
		return tlsProps;
	}
	
	public static synchronized Properties getSmtpProperties(String host, String port, String from, boolean useSmtpAuth, boolean debug) {
		Properties props = new Properties();
		props.put("mail.smtp.port", port);
		props.put("mail.smtp.host", host);
		if(debug) props.put("mail.smtp.debug", "true");
		if(useSmtpAuth) props.put("mail.smtp.auth", "true");
		else props.put("mail.smtp.auth", "false");
		props.put("mail.smtp.starttls.enable", "true");
		props.put("mail.smtp.from", from);
		return props;
	}
	
	private static Session getAuthenticatedSession(Properties prop, String user, String pass) {
		final String username = user;
		final String password = pass;

		Authenticator auth = new Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(username, password);
			}
		};
		return Session.getInstance(prop, auth);
	}
	
	private static void debugSession(Session session) {
		Properties sessionProps = session.getProperties();
		sessionProps.list(System.out);
	}
	
	private void init(String host, String port, String user, String pass, String from, boolean useSsl, boolean debug) {
		Properties smtpProps;
		if (useSsl) {
			smtpProps = getTlsSmtpProperties(host, port, (user != null && !user.isEmpty()), debug);
		} else {
			smtpProps = getSmtpProperties(host, port, from, (user != null && !user.isEmpty()), debug);
		}
		this.host = host;
		this.useSsl = useSsl;
		this.from = from;
	    session = getAuthenticatedSession(smtpProps, user, pass);
	    if(debug) {
		    session.setDebug(true);
			debugSession(session);
	    }
	}
	
	public EmailUtil(String host, String port, String user, String pass, String from, boolean useSsl, boolean debug) {
		init(host, port, user, pass, from, useSsl, debug);
	}
	
	public EmailUtil(String host, String port, String user, String pass, String from, boolean debug) {
		init(host, port, user, pass, from, false, debug);
	}
	
	public EmailUtil(String host, String port, String user, String pass, String from) {
		init(host, port, user, pass, from, false, false);
	}
	
	public static EmailUtil getInstance(Properties prop) {
		if(emailInstance == null) {
			synchronized (EmailUtil.class){
                if (emailInstance == null) {
                	emailInstance = new EmailUtil(prop);
                }
			}
		}
		return emailInstance;
	}
	
	public boolean sendEmail(String tipo, String to, List<String> copyTo, List<String> copyToBcc, String subject, String id, Object result, File folderTemplate, String view, String urlWeb, Object user) { 
		return sendEmail(tipo, to, copyTo, copyToBcc, subject, id, result, folderTemplate, view, urlWeb, user, null);
	}
	
	public boolean sendEmail(String tipo, String to, List<String> copyTo, List<String> copyToBcc, String subject, String id, Object result, File folderTemplate, String view, String urlWeb, Object user, File file) {
		return sendEmailFiles(tipo, to, copyTo, copyToBcc, subject, id, result, folderTemplate, view, urlWeb, user, file==null?null:Arrays.asList(file), null, null);
	}

	public String getTextFromTemplate(File folderTemplate, String view, Map<String, Object> params) {
		Configuration cfg = new Configuration();
		cfg.setTagSyntax(Configuration.SQUARE_BRACKET_TAG_SYNTAX);
		cfg.setDateFormat("dd/MM/yyyy hh:mm:ss a");
		cfg.setWhitespaceStripping(true);
		cfg.setDefaultEncoding("UTF-8");
		
		try {
			FileTemplateLoader templateLoader = new FileTemplateLoader(folderTemplate);
			cfg.setTemplateLoader(templateLoader);
			Template template = cfg.getTemplate(view);
			
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			OutputStreamWriter os = new OutputStreamWriter(baos);
			template.process(params, os);
			
			String body = baos.toString("UTF-8");
			os.close();
			baos.close();
			
			return body;
		} catch (Exception e) {
			throw new HTGException("Error al generar body text", e);
		}
	}
	
	public boolean sendEmailFiles(String tipo, String to, List<String> copyTo, List<String> copyToBcc, String subject, String id, Object result, File folderTemplate, String view, String urlWeb, Object user, List<File> files, List<File> images, Map<String, String> headers) {
		try {
			Map<String, Object> mav = new HashMap<String, Object>();
		    
			mav.put("escape", (new StringEscapeUtils()));
			mav.put("urlWeb", urlWeb);
			mav.put("tipo", tipo);
			mav.put("result", result);
			mav.put("user", user);
			mav.put("id", id);
			
			String body = getTextFromTemplate(folderTemplate, view, mav);
			
			sendMail(to, copyTo, copyToBcc, subject, body, files, images, headers);
			return true;
		} catch (Exception e) {
			log.error("Error en envio de correo: host= "+host+"; from="+from+"; to="+to+"; "+subject, e);
			return false;
		}
	}
	
	private void sendMail(String to, List<String> copyTo, List<String> copyToBcc, String subject, String body, List<File> files, List<File> images, Map<String, String> headers) throws AddressException, MessagingException {
		MimeMessage message = new MimeMessage(session);
		log.debug("Envia mail from: " + from + "; "+to+"; "+subject);

		if(headers != null) {
			for(String key : headers.keySet()) {
				message.addHeader(key, headers.get(key));
			}
		}
		
		message.setFrom(new InternetAddress(from));
		InternetAddress[] recipientAddress = InternetAddress.parse(to);
		message.setRecipients(Message.RecipientType.TO, recipientAddress);
		
		if(copyTo != null && copyTo.size()>0) {
			for(String cc : copyTo) {
				if(!cc.equalsIgnoreCase(to)) message.addRecipient(Message.RecipientType.CC, new InternetAddress(cc));
			}
		}
		if(copyToBcc != null && copyToBcc.size()>0) {
			for(String cc : copyToBcc) {
				if(!cc.equalsIgnoreCase(to)) message.addRecipient(Message.RecipientType.BCC, new InternetAddress(cc));
			}
		}
		//message.reply(false);
		message.setSubject(subject);
		Multipart multipart = new MimeMultipart();
		BodyPart htmlBodyPart = new MimeBodyPart();
		htmlBodyPart.setContent(body , "text/html");
		multipart.addBodyPart(htmlBodyPart);
		if(files != null) {
			for(int i=0;i<files.size();i++) {
				File file = files.get(i);
				BodyPart messageBodyPart = new MimeBodyPart();
				DataSource source = new FileDataSource(file.getAbsolutePath());
				messageBodyPart.setDataHandler(new DataHandler(source));
				String fileName = file.getName();
				if(fileName.contains("__")) {
					fileName = fileName.substring(fileName.lastIndexOf("__")+2);
				}
		        messageBodyPart.setFileName(fileName);
		        multipart.addBodyPart(messageBodyPart);
			}
		}
		if(images != null) {
			for(int i=0;i<images.size();i++) {
				File file = images.get(i);
				BodyPart messageBodyPart = new MimeBodyPart();
				DataSource source = new FileDataSource(file.getAbsolutePath());
				messageBodyPart.setDataHandler(new DataHandler(source));
				messageBodyPart.setHeader("Content-ID", "<"+file.getName()+">");
		        messageBodyPart.setFileName(file.getName());
		        multipart.addBodyPart(messageBodyPart);
			}
		}
		message.setContent(multipart);
		
		Transport transport;
		if (useSsl) {
			transport = session.getTransport("smtps");
		} else {
			transport = session.getTransport("smtp");
		}
		try {
			//transport.connect(host, user, pass);
			transport.connect();
			transport.sendMessage(message, message.getAllRecipients());
		} finally {
			transport.close();
			System.out.println("Connection to " + host + " closed");
		}

		//Transport.send(message);
	}
}
