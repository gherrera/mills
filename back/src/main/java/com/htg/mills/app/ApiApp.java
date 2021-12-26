package com.htg.mills.app;

import java.util.UUID;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.htg.mills.dao.Dao;
import com.htg.mills.entities.NotificationAWS;

@Service
public class ApiApp {
	private static Logger log = LogManager.getLogger(ApiApp.class);
	private Dao dao;

	public ApiApp() {
		try {
			dao = new Dao();
		} catch (Exception e) {
			log.error("Error al instanciar service",e);
		}
	}
	
	public String insertNotificationAWS(String jsonString) throws JSONException {
		JSONObject obj = new JSONObject(jsonString);
		if("SubscriptionConfirmation".equals(obj.getString("Type"))) {
			String subscribeUrl = obj.getString("SubscribeURL");
			ResponseEntity<String> response = new RestTemplate().getForEntity(subscribeUrl, String.class);
			log.debug(response);
		}else if("Notification".equals(obj.getString("Type"))) {
			JSONObject json = new JSONObject(obj.getString("Message"));

			JSONObject mail = json.getJSONObject("mail");
			NotificationAWS notification = new NotificationAWS();
			notification.setId(UUID.randomUUID().toString());
			notification.setType(json.getString("notificationType"));
			notification.setMessageId(mail.getString("messageId"));
			notification.setFrom(mail.getString("source"));
			String message = null;
			String to = null;
			String timestamp = null;
			if(notification.getType().equals("Delivery")) {
				JSONObject delivery = (JSONObject)json.get("delivery");
				to = delivery.getString("recipients");
				timestamp = delivery.getString("timestamp");
			}else if(notification.getType().equals("Bounce")) {
				JSONObject bounce = (JSONObject)json.get("bounce");
				JSONObject bouncedRecipients = ((JSONArray)bounce.get("bouncedRecipients")).getJSONObject(0);
				if(bouncedRecipients.has("diagnosticCode")) message = bouncedRecipients.getString("diagnosticCode");
				to = bouncedRecipients.getString("emailAddress");
				timestamp = bounce.getString("timestamp");
			}else if(notification.getType().equals("Complaint")) {
				JSONObject complaint = (JSONObject)json.get("complaint");
				JSONObject complainedRecipients = ((JSONArray)complaint.get("complainedRecipients")).getJSONObject(0);
				to = complainedRecipients.getString("emailAddress");
				timestamp = complaint.getString("timestamp");
			}
			notification.setTimestamp(timestamp);
			notification.setMessage(message);
			notification.setTo(to);
			JSONObject commonHeaders = mail.getJSONObject("commonHeaders");
			JSONArray headers = mail.getJSONArray("headers");
			for (int i = 0; i < headers.length(); i++) {
				JSONObject elem = (JSONObject)headers.get(i);
				if(elem.getString("name").equals("form-id")) {
					notification.setFormId(elem.getString("value"));
				}
			}
			notification.setSubject(commonHeaders.getString("subject"));
			notification.setDestination(commonHeaders.getString("to"));
			notification.setJson(jsonString);
			
			//dao.insertNotificationAWS(notification);
		}
		return "OK";
	}
	
}
