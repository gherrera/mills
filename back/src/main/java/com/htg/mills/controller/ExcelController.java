package com.htg.mills.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

import com.htg.mills.app.ApiApp;

@Component
public class ExcelController extends AbstractXlsxView implements InitializingBean {
	private static Logger log = LogManager.getLogger(ExcelController.class);

	@Autowired
	private ApiApp app;
	private static ApiApp appPrivate;
	
	@Override
    public void afterPropertiesSet() throws Exception {
		if (app != null) appPrivate = app;
	}
	
	private XSSFCellStyle getColor(Workbook workbook, int r, int g, int b) {
		XSSFCellStyle cellStyle = (XSSFCellStyle)workbook.createCellStyle();
		XSSFColor color = new XSSFColor(new java.awt.Color(r, g, b));
		cellStyle.setFillForegroundColor(color);
		cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);  
		cellStyle.setFillBackgroundColor(HSSFColor.HSSFColorPredefined.GREY_25_PERCENT.getIndex());
		return cellStyle;
	}
	
	private void excelTiposEquipo(Workbook workbook, List<Map<String, Object>> tiposEquipo, CellStyle cellStyleTitle, CellStyle dateStyle) {
		Cell cell;
		CellStyle cellStyleSkyBlue = getColor(workbook, 221, 235, 247);
		
		Sheet sheet = workbook.createSheet("Tipos de equipo");
		Row header = sheet.createRow(0);
		cell = header.createCell(0);
		cell.setCellStyle(cellStyleSkyBlue);
		cell.setCellValue("Tipo de equipo");

		if(tiposEquipo != null) {
			int rowNum = 1;
			for(Map<String, Object> te : tiposEquipo) {
				Row row = sheet.createRow(rowNum++);
				
				cell = row.createCell(0);
				cell.setCellValue((String)te.get("tipo"));
			}
		}
		sheet.autoSizeColumn(0);
	}

	@SuppressWarnings("unchecked")
	private void excelTiposPieza(Workbook workbook, List<Map<String, Object>> tiposPieza, CellStyle cellStyleTitle, CellStyle dateStyle) {
		Cell cell;
		CellStyle cellStyleSkyBlue = getColor(workbook, 221, 235, 247);
		
		Sheet sheet = workbook.createSheet("Tipos de pieza");
		Row header = sheet.createRow(0);
		
		cell = header.createCell(0);
		cell.setCellStyle(cellStyleSkyBlue);
		cell.setCellValue("Tipo");

		cell = header.createCell(1);
		cell.setCellStyle(cellStyleSkyBlue);
		cell.setCellValue("Pieza");

		if(tiposPieza != null) {
			int rowNum = 1;
			for(Map<String, Object> tp : tiposPieza) {
				String type = (String)tp.get("type");
				List<String> pieces = (List<String>)tp.get("pieces");
				
				for(String piece : pieces) {
					Row row = sheet.createRow(rowNum++);
					
					cell = row.createCell(0);
					cell.setCellValue(type);
					
					cell = row.createCell(1);
					cell.setCellValue(piece);
				}
			}
		}
		sheet.autoSizeColumn(0);
		sheet.autoSizeColumn(1);
	}
	
	private void excelPersonal(Workbook workbook, List<Map<String, String>> personal, CellStyle cellStyleTitle, CellStyle dateStyle) {
		Cell cell;
		CellStyle cellStyleSkyBlue = getColor(workbook, 221, 235, 247);
		
		Sheet sheet = workbook.createSheet("Personal");
		Row header = sheet.createRow(0);
		
		cell = header.createCell(0);
		cell.setCellStyle(cellStyleSkyBlue);
		cell.setCellValue("Rut");

		cell = header.createCell(1);
		cell.setCellStyle(cellStyleSkyBlue);
		cell.setCellValue("Nombre");

		if(personal != null) {
			int rowNum = 1;
			for(Map<String, String> persona : personal) {
				Row row = sheet.createRow(rowNum++);
					
				cell = row.createCell(0);
				cell.setCellValue(persona.get("rut"));
				
				cell = row.createCell(1);
				cell.setCellValue(persona.get("nombre"));
			}
		}
		sheet.autoSizeColumn(0);
		sheet.autoSizeColumn(1);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void buildExcelDocument(Map<String, Object> model, Workbook workbook, HttpServletRequest request,
			HttpServletResponse response) {
		try {
			CellStyle cellStyleTitle = workbook.createCellStyle();  
			cellStyleTitle.setFillForegroundColor(HSSFColor.HSSFColorPredefined.LIGHT_CORNFLOWER_BLUE.getIndex());
			cellStyleTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);  
			cellStyleTitle.setFillBackgroundColor(HSSFColor.HSSFColorPredefined.GREY_25_PERCENT.getIndex());
			
			CellStyle dateStyle = workbook.createCellStyle();
			CreationHelper createHelper = workbook.getCreationHelper();
			dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/mm/yyyy"));
						
			if(model.get("tiposEquipo") != null) {
				List<Map<String, Object>> tiposEquipo = (List<Map<String, Object>>)model.get("tiposEquipo");
				excelTiposEquipo(workbook, tiposEquipo, cellStyleTitle, dateStyle);
			}else if(model.get("tiposPieza") != null) {
				List<Map<String, Object>> tiposPieza = (List<Map<String, Object>>)model.get("tiposPieza");
				excelTiposPieza(workbook, tiposPieza, cellStyleTitle, dateStyle);
			}else if(model.get("personal") != null) {
				List<Map<String, String>> personal = (List<Map<String, String>>)model.get("personal");
				excelPersonal(workbook, personal, cellStyleTitle, dateStyle);
			}
		}catch(Exception e) {
			log.debug("Error al generar reporte", e);
		}
	}
}
