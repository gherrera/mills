package com.htg.mills.reader;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;

public class TextReader extends BufferedReader implements IReader {

	private long lines;
	public TextReader(File file) throws IOException {
		super(new InputStreamReader(new FileInputStream(file), Reader.guessCharset(new FileInputStream(file))));
		
		InputStream is = new FileInputStream(file);
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(is, Reader.guessCharset(is)));
		long lines = 0;
		String line;
		while ((line = bufferedReader.readLine()) != null) {
			if(line != null) {
				lines++;
			}
		}
		bufferedReader.close();
		
		this.lines = lines;
	}

	public TextReader(InputStream is, String encoding) throws IOException {
		super(new InputStreamReader(is, Charset.forName(encoding)));
	}
	
	public static String ltrim(String s, String caracter) { 
		int i = 0;
		while (i < s.length() && caracter.equals(s.substring(i,i+1))) {
			i++;
		}
		return s.substring(i);
	}
	
	public String getRut() throws IOException {
		String rut = this.readLine();
		if(rut != null) {
			rut = rut.trim().replaceAll("\\.", "");
			rut = rut.replaceAll("-", "");
			rut = ltrim(rut,"0");
		}
		return rut;
	}
	
	public String getCleanLine() throws IOException {
		String line = this.readLine();
		if(line != null) {
			line = line.trim();
		}
		return line;
	}
	
	public String getLine(int s) throws IOException {
		return this.readLine();
	}
	
	public int getNumHojas() {
		return 1;
	}
	
	public long getLines() {
		return lines;
	}
	
	public void close() throws IOException {
		super.close();
	}
}
