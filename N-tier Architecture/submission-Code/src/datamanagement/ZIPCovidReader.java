package edu.upenn.cit594.datamanagement;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.json.simple.parser.ParseException;

import edu.upenn.cit594.util.ZIPCodeDataHandler;

public abstract class ZIPCovidReader {
	
	public ZIPCodeDataHandler zipCodeDataHandler;
	
	public File file;
	
	public ZIPCovidReader(File file, ZIPCodeDataHandler zipCodeData) {
		this.setZipCodeData(zipCodeData); 
		this.setFile(file);
	}

	public abstract void readCovidData() throws FileNotFoundException, IOException, ParseException, java.text.ParseException; 
	
	private void setZipCodeData(ZIPCodeDataHandler zipCodeData) {
		this.zipCodeDataHandler = zipCodeData;
	}
	
	private void setFile(File file) {
		this.file = file;
	}
	
}
