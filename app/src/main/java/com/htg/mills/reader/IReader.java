package com.htg.mills.reader;

import java.io.IOException;


public interface IReader {

	public String getLine(int s) throws IOException;
	public int getNumHojas();
	public long getLines();
	public void close() throws IOException;
	
}
