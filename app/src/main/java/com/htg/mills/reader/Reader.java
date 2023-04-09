package com.htg.mills.reader;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.tika.detect.AutoDetectReader;

public class Reader extends BufferedReader {

	protected static Logger log = LogManager.getLogger(Reader.class);
	
	public Reader(File file) throws IOException {
		super(new InputStreamReader( new FileInputStream( file ), guessCharset(new FileInputStream(file))));
	}
	
	public Reader(InputStream is, boolean charset) throws IOException {
		super(new InputStreamReader( is, charset?guessCharset(is):null));
	}

	public Reader(InputStream is) throws IOException {
		super(new InputStreamReader( is, guessCharset(is)));
	}
	
	public static Charset guessCharset(InputStream is) throws IOException {
		Charset charset = Charset.forName("utf-8");
		try {
			AutoDetectReader auto = new AutoDetectReader(is);
			charset = auto.getCharset();
		}catch(Exception e) {
			charset = Charset.forName(new InputStreamReader(is).getEncoding());
		}
		return charset;
	}	
	
	public long getNumLines() {
		long lines = 0;
		try {
			while (this.readLine() != null) {
				lines++;
			}
		} catch (IOException e) {
		}
		return lines;
	}
	
}
