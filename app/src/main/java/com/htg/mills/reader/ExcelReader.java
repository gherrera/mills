package com.htg.mills.reader;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExcelReader implements IReader {
	private static SimpleDateFormat format = new SimpleDateFormat("dd/MM/yyyy");
	
	private XSSFWorkbook workBook;
	private XSSFSheet sheet;
	int numSheet;
	int numRow;
	
	public ExcelReader(File file) throws IOException {
		workBook = new XSSFWorkbook(file.getAbsolutePath());
		numSheet = 0;
		numRow = 0;
		sheet = workBook.getSheetAt(0);
	}
	
	public long getLines() {
		long filas = 0; 
		for(int s=0;s<workBook.getNumberOfSheets();s++) {
			XSSFSheet sheet = workBook.getSheetAt(s);
			if(sheet != null) {
				filas += sheet.getLastRowNum();
			}
		}
		return filas;
	}
	
	public int getNumHojas() {
		return workBook.getNumberOfSheets();
	}
	
	public String getLine(int s) {
		String data[] = getArrayLine(s);
		if(data != null && data.length>0) {
			for (int i=0; i < data.length; i++) {
				if(data[i] != null) data[i] = data[i].replaceAll("\\t", " ");
			}
			return StringUtils.join(data, (char)9);
		}else {
			return null;
		}
	}
	
	private String[] getArrayLine(int s) {
		Cell celda;
		String data[] = null;
		if(numSheet != s) {
			sheet = workBook.getSheetAt(s);
			numSheet = s;
			numRow = 0;
		}
		if(sheet != null) {
			Row row = sheet.getRow(numRow++);
			if(row != null && row.getLastCellNum() > 0) {
				data = new String[row.getLastCellNum()];
				for(int j=0;j<row.getLastCellNum();j++) {
					celda = row.getCell(j);
					if(celda != null) {
			            switch (celda.getCellTypeEnum()) {
			            	case NUMERIC:
			            		if(DateUtil.isCellDateFormatted(celda)) {
									data[j] = format.format(celda.getDateCellValue());
								}else if(new Double(celda.getNumericCellValue()).toString().indexOf("E")>0) {
									data[j] = new BigDecimal(celda.getNumericCellValue()).toString();
								}else {
									celda.setCellType(CellType.STRING);
									data[j] = celda.getStringCellValue().trim();
								}
			            		break;
			            	default:
			            		if(!celda.getCellTypeEnum().equals(CellType.STRING)) celda.setCellType(CellType.STRING);
								data[j] = celda.getStringCellValue().trim();
			            }
					}
				}
			}
		}
		return data;
	}

	@Override
	public void close() throws IOException {
		workBook.close();
	}
	
}
