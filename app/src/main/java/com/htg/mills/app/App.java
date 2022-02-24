package com.htg.mills.app;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.javascript.SilentJavaScriptErrorListener;
import com.htg.mills.dao.Dao;
import com.htg.mills.entities.Results;
import com.htg.mills.entities.Token;
import com.htg.mills.entities.Usuario;
import com.htg.mills.entities.maintenance.Etapa;
import com.htg.mills.entities.maintenance.Molino;
import com.htg.mills.entities.maintenance.Persona;
import com.htg.mills.entities.maintenance.Tarea;
import com.htg.mills.entities.maintenance.Turno;
import com.htg.mills.exceptions.HTGException;
import com.htg.mills.utils.EmailUtil;
import com.htg.mills.utils.Security;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.attach.ITagWorker;
import com.itextpdf.html2pdf.attach.ProcessorContext;
import com.itextpdf.html2pdf.attach.impl.DefaultTagWorkerFactory;
import com.itextpdf.html2pdf.attach.impl.tags.HtmlTagWorker;
import com.itextpdf.html2pdf.html.TagConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.styledxmlparser.node.IElementNode;

@Service
public class App {

	private Dao dao;
	private static Logger log = LogManager.getLogger(App.class);
	public static Format formatterMonth = new SimpleDateFormat("yyyy-MM");
	public static String formsFolder;
	private Map<String, String> parametros = null;
	private WebClient webClient;
	private EmailUtil email;
	private String frontUrl;
	private String apiUrl;
	private File folderTemplate;
	public static Format formatterDate = new SimpleDateFormat("yyyyMMdd");

	public App() {
		try {
			dao = new Dao();

			parametros = dao.getParametros();
			formsFolder = parametros.get("forms.folder");
			frontUrl = parametros.get("front.url");
			apiUrl = parametros.get("api.url");
			folderTemplate = new File("." + parametros.get("base.path"));

			webClient = new WebClient(BrowserVersion.getDefault());
			
			webClient.getOptions().setThrowExceptionOnScriptError(false);
			webClient.getOptions().setThrowExceptionOnFailingStatusCode(false);
			webClient.getOptions().setPrintContentOnFailingStatusCode(false);
			webClient.setJavaScriptErrorListener(new SilentJavaScriptErrorListener());
			
			email = new EmailUtil(parametros.get("mail.host"), parametros.get("mail.port"), parametros.get("mail.username"), parametros.get("mail.password"), parametros.get("mail.from"), true, false);
		} catch (Exception e) {
			log.error("Error al instanciar service",e);
		}
	}
		
	public void createToken(Usuario usuario, int maxSessions, String tokenId, Date expiration) {
		Token token = new Token();
		token.setId(UUID.randomUUID().toString());
		token.setUser(usuario);
		token.setToken(tokenId);
		token.setExpiration(expiration);
		token.setCreation(new Date());
	
		dao.createToken(token);
		if(maxSessions > 0) {
			dao.deleteOtherTokens(token);
		}
	}
	
	public void renewToken(String oldToken, Usuario usuario, String tokenId, Date expiration) {
		Token token = new Token();
		token.setId(UUID.randomUUID().toString());
		token.setUser(usuario);
		token.setToken(tokenId);
		token.setExpiration(expiration);
		token.setCreation(new Date());
		
		dao.renewToken(oldToken, token);
	}
	
	public void deleteToken(String token) {
		dao.deleteToken(token);
	}

	public Usuario getUserByLogin(String login) {
		return dao.getUserByLogin(login);
	}
	
	public Usuario getUserById(String id) {
		return dao.getUserById(id);
	}
	
	public String getParametroByKey(String key) {
		return dao.getParametros().get(key);
	}
	
	public String getParametrosByKey(String key) {
		return parametros.get(key);
	}
	
	private JSONObject callUrl(String url, String body) throws Exception {
    	HttpURLConnection con=null;
        try {
			URL _url = new URL(url);
			con = (HttpURLConnection) _url.openConnection();

			con.setDoOutput(true);
			con.setDoInput(true);
			con.setRequestMethod("POST");
			con.setRequestProperty("Content-Type", "application/json");
			
			OutputStream os = con.getOutputStream();
            os.write(body.getBytes("UTF-8"));
            os.close();
            
            InputStream in = new BufferedInputStream(con.getInputStream());
            String response = IOUtils.toString(in, "UTF-8");
            //log.debug("url: "+url);
            //log.debug("body: "+body);
            //log.debug("response: "+response);
            JSONObject json = new JSONObject(response);
            in.close();

	        return json;
        }catch(Exception e) {
        	log.error("Error al invocar url", e);
        	throw e;
        } finally {
			try{if(con!=null)con.disconnect();}catch(Exception e){}
		}
    }
	
	private boolean validatePassword(String password) {
		if(password.length()<8 && password.length()>20) {
			throw new HTGException("Clave debe tener entre 8-20 caracteres");
		}else {
			if (!password.matches("^[a-zA-Z0-9]*$") || password.matches("^[0-9]*$") || password.matches("^[a-zA-Z]*$")) {
				throw new HTGException("Clave debe ser Alfanumerica");
			}else {
				if (password.equals(password.toUpperCase())) {
					throw new HTGException("Clave debe contener minuscula");
				}else {
					if (password.equals(password.toLowerCase())) {
						throw new HTGException("Clave debe contener mayuscula");
					}
				}
			}
		}
		return true;
	}
	
	private boolean validatePassword(Usuario user, String password) {
		if((user.getLogin().toLowerCase().contains(password.toLowerCase())
				||
				password.toLowerCase().contains(user.getLogin().toLowerCase()))
		) {
			throw new HTGException("Clave no puede estar contenida en el login");
		}else {
			return validatePassword(password);
		}
	}
	
	public void saveUser(Usuario user, String mode, Usuario usuario) {
		try {			
			boolean newUser=false;
			if(usuario.getId() != null && usuario.getId().isEmpty()) {
				usuario.setId(null);
				newUser=true;
			}
			if(usuario.getId() != null && !usuario.getId().isEmpty()) {
				Usuario u = getUserById(usuario.getId());
				if(u.getType().equals(Usuario.Type.ADMIN) && !u.getType().equals(usuario.getType())){
					throw new HTGException("No permitido");
				}else if(!u.getType().equals(Usuario.Type.ADMIN) && usuario.getType().equals(Usuario.Type.ADMIN)) {
					throw new HTGException("No permitido");
				}
			}else if(usuario.getType().equals(Usuario.Type.ADMIN)) {
				throw new HTGException("No permitido");
			}else {
				usuario.setId(UUID.randomUUID().toString());
				Calendar c = Calendar.getInstance(TimeZone.getDefault());
				Date date = c.getTime();
				Timestamp t = new Timestamp(date.getTime());
				usuario.setCreationDate(t);
			}
			if(usuario.getPassword() != null && usuario.getPassword().isEmpty()) {
				usuario.setPassword(null);
			}
			if(usuario.getPassword() != null) {
				validatePassword(user, usuario.getPassword());
			}
			String pwd = usuario.getPassword();
			pwd = Security.getSha256Value(pwd);
			usuario.setPassword(pwd);
			
			dao.saveUser(user, mode, usuario);
			if(usuario != null) {
				if(!newUser && usuario.getPassword() != null) {
					dao.resetPassword(usuario);
				}
				//insertRegistroMovimiento(usuario, typeMov, null, null, user, user.getClass());
			}			
		} catch (SQLException e) {
			log.error("Error al grabar usuario", e);
			throw new HTGException("Error al grabar usuario", e);
		}
	}
	
	public boolean changePwd(Usuario usuario, Usuario user, String newPwd) {
		validatePassword(user, newPwd);

		user.setPassword(Security.getSha256Value(newPwd));
	
		if(user.getFeActivacion() == null) {
			Calendar c = Calendar.getInstance(TimeZone.getDefault());
			Date date = c.getTime();
			Timestamp t = new Timestamp(date.getTime());
			user.setFeActivacion(t);
		}
		try {
			dao.saveUser(usuario, "U", user);
			//insertRegistroMovimiento(user, Movimiento.Type.UPDATE, "Cambia clave", null, user, user.getClass());
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public Token getToken(String token) {
		return dao.getToken(token);
	}
	
	public Results getUsers() {
		try {
			List<Usuario> usuarios = dao.getUsers();
			Results results = new Results();
			results.setTotal(usuarios.size());
			results.setRecords(usuarios);
			return results;
		} catch (Exception e) {
			log.error("Error al obtener clientes", e);
			throw new HTGException("Error al obtener clientes", e);
		}
	}
	
	public void deleteUser(Usuario user, String id) {
		try {
			dao.deleteUser(user, id);
		} catch (Exception e) {
			log.error("Error al borrar datos usuario: "+id, e);
			throw new HTGException("Error al borrar datos usuario: "+id, e);
		}
	}
	
	private String urlToHTML(String url) {
		HtmlPage page;
		try {
			//long start = System.currentTimeMillis();
			page = webClient.getPage(url);
			//Wait for background Javascript
			webClient.waitForBackgroundJavaScript(10000);
			//long end = System.currentTimeMillis();
			//log.debug("getPage: " + (end - start) + " ms");

			String html = page.asXml();

			html = html.substring(html.indexOf("<html"));
			String first = html.substring(0, html.indexOf("<noscript>"));
			String second = html.substring(html.indexOf("</noscript>")+11);
			
			return first + second;
		} catch (Exception e) {
			log.error("Error al obtener html: "+url, e);
		}
		return null;
	}
	
	public class CustomTagWorkerFactory extends DefaultTagWorkerFactory {
	     public ITagWorker getCustomTagWorker(IElementNode tag, ProcessorContext context) {
	         if (TagConstants.HTML.equals(tag.name())) {
	             return new ZeroMarginHtmlTagWorker(tag, context);
	         }
	         return null;
	     }
	}


	public class ZeroMarginHtmlTagWorker extends HtmlTagWorker {
	     public ZeroMarginHtmlTagWorker(IElementNode element, ProcessorContext context) {
	         super(element, context);
	         Document doc = (Document) getElementResult();
	         doc.setMargins(18, 18, 18, 18);
	     }
	}
	
	private PdfDocument htmlToPdf(String html, OutputStream os) {
		long start = System.currentTimeMillis();
		
		ConverterProperties prop = new ConverterProperties();
		//frontUrl = "https://api.formularia.net";
		prop.setBaseUri(frontUrl);
		prop.setTagWorkerFactory(new CustomTagWorkerFactory());
		
		PdfWriter writer = new PdfWriter(os);
	    PdfDocument pdfDocument = new PdfDocument(writer);
		pdfDocument.setDefaultPageSize(PageSize.A4);

		try {
			HtmlConverter.convertToPdf(html, pdfDocument, prop);
			pdfDocument.close();
			writer.close();
		} catch (Exception e) {
			log.error("Error al generar pdf", e);
			throw new HTGException("Error al generar pdf", e);
		}
		long end = System.currentTimeMillis();
		log.debug("htmlToPdf: " + (end - start) + " ms");

		return pdfDocument;
	}
	
	private PdfDocument pageToPdf(String url, OutputStream os) throws IOException {
		//long start = System.currentTimeMillis();
		log.debug("Transform html: "+url);
		String html = null;
		int intento = 0;
		while(html == null && intento < 3) {
			if(intento > 0) try {Thread.sleep(5000);} catch (InterruptedException e) {}
			intento++;
			log.debug("Obtiene html intento: "+intento+"; "+url);
			html = urlToHTML(url);
		}
		//long end = System.currentTimeMillis();
		//log.debug("urlToHTML: " + (end - start) + " ms");
		
		log.debug("Transform pdf: "+url);
		return htmlToPdf(html, os);
	}

	public String resetPassword(Usuario usuario) {
		try {
			String newPwd = RandomStringUtils.randomAlphanumeric(8);
			usuario.setPassword(Security.getSha256Value(newPwd));
			log.debug(newPwd);
			dao.resetPassword(usuario);
			//insertRegistroMovimiento(usuario, Movimiento.Type.UPDATE, "Reset clave", null, usuario, usuario.getClass());
			email.sendEmail("", usuario.getEmail(), null, null, "Nueva clave MILL'S", null, newPwd, folderTemplate, "views/resetPassword.ftl", apiUrl, usuario);
			return newPwd;
		} catch (Exception e) {
			log.error("Error al resetear clave", e);
			return null;
		}
	}

	public List<Turno> getTurnosActivosController(String userId) {
		return dao.getTurnosActivosController(userId);
	}
	
	public List<Molino> getMolinos(String userId, Map<String, String> params) {
		return dao.getMolinos(params);
	}
	
	public Molino saveMolino(Usuario user, Molino molino) {
		try {
			dao.saveMolino(user, molino);
			return dao.getMolinoById(molino.getId());
		} catch (SQLException e) {
			log.error("Error al guardar Molino", e);
			return null;
		}
	}
	
	public Turno inicioTurno(Usuario user, String id) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(!Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.inicioTurno(user, turno);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar turno", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("inicioTurno: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno finTurno(Usuario user, String id) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE)) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.finTurno(user, turno);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar turno", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("finTurno: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno startTask(Usuario user, String id, Etapa.EtapaEnum stage) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.startTask(user, turno, stage);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar turno", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("startTask: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno finishTask(Usuario user, String id, Etapa.EtapaEnum stage) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.finishTask(user, turno, stage);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar turno", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("finishTask: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno getTurnoById(String id) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = dao.getTurnoById(id);
		long lEndTime = System.currentTimeMillis();
		log.debug("getTurnoById: "+(lEndTime-lStartTime)+"ms");

		return turno;
}
	
	public Turno startEtapa(Usuario user, String id) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.startEtapa(user, turno);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar etapa", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("startEtapa: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno finishEtapa(Usuario user, String id) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.finishEtapa(user, turno);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar etapa", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("finishEtapa: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno addParte(Usuario user, String id, Tarea.TareaEnum task, String parteId, int cant) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.addParte(user, turno, task, parteId, cant);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar etapa", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("addParte: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno startInterruption(Usuario user, String id, String desc) {
		long lStartTime = System.currentTimeMillis();

		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.startInterruption(user, turno, desc);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al iniciar interrupcion", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("startInterruption: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
	public Turno finishInterruption(Usuario user, String id) {
		long lStartTime = System.currentTimeMillis();
		
		Turno turno = getTurnoById(id);
		if(Turno.Status.OPEN.equals(turno.getStatus())) {
			if(turno.getMolino().getStatusAdmin().equals(Molino.StatusAdmin.ACTIVE) && !Molino.Status.FINISHED.equals(turno.getMolino().getStatus())) {
				boolean existe = false;
				for(Persona persona : turno.getPersonas()) {
					if(user.getId().equals(persona.getControllerId())) {
						existe = true;
					}
				}
				if(existe) {
					try {
						dao.finishInterruption(user, turno);
						turno = getTurnoById(id);
					} catch (SQLException e) {
						log.error("Error al finalizar interrupcion", e);
					}
				}
			}
		}
		long lEndTime = System.currentTimeMillis();
		log.debug("finishInterruption: "+(lEndTime-lStartTime)+"ms");
		return turno;
	}
	
}
