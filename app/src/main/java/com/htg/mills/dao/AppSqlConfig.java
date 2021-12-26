package com.htg.mills.dao;

import java.io.Reader;
import java.util.Properties;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.ibatis.common.resources.Resources;
import com.ibatis.sqlmap.client.SqlMapClient;
import com.ibatis.sqlmap.client.SqlMapClientBuilder;

public class AppSqlConfig {
	private static SqlMapClient sqlMap;
	private static Logger log = LogManager.getLogger(AppSqlConfig.class);

	static {
		try {
			String resource="aml-ibatis-config/sql-map-config.xml";
		    Reader reader = Resources.getResourceAsReader(resource);
		    Properties databaseProperty = new Properties();
			databaseProperty.put("db_host", System.getenv("MILLS_DB__HOSTNAME"));
			databaseProperty.put("db_port", System.getenv("MILLS_DB_PORT"));
			databaseProperty.put("db_name", System.getenv("MILLS_DB_NAME"));
			databaseProperty.put("db_user", System.getenv("MILLS_DB_USERNAME"));
			databaseProperty.put("db_passwd", System.getenv("MILLS_DB_PASSWORD"));
		    sqlMap = SqlMapClientBuilder.buildSqlMapClient(reader, databaseProperty);
		}catch (Exception e) {
			log.error("Error al conectar con base de datos", e);
		}
	}
	public static SqlMapClient getSqlMapInstance(){
		return sqlMap;
	}

}
