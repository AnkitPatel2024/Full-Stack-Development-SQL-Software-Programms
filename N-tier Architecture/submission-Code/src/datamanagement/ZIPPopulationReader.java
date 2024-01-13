package edu.upenn.cit594.datamanagement;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;

import edu.upenn.cit594.util.ZIPCode;
import edu.upenn.cit594.util.ZIPCodeDataHandler;

public class ZIPPopulationReader {

	public File file;
	public ZIPCodeDataHandler zipCodeDataHandler;
	
	public ZIPPopulationReader(File file, ZIPCodeDataHandler zipCodeDataHandler) {
		this.file = file;
		this.zipCodeDataHandler = zipCodeDataHandler;
	}

	public void readPopulationData() throws IOException, ParseException {
		// Lexing of CSV File below
		FileReader in = new FileReader(this.file);
		ArrayList<ArrayList<String>> rows = CSVLexer.lexString(in);
		
		// We get the index of the zip_code and etl_timestamp columns from the resulting lexed content.
		int zipIndex = rows.get(0).indexOf("zip_code");
		int popIndex = rows.get(0).indexOf("population");
		
		for (int i = 1; i < rows.size(); i++) {
			// Retrieve the zip code and date 
			int zip = Integer.parseInt(rows.get(i).get(zipIndex)); 
			int pop = Integer.parseInt(rows.get(i).get(popIndex)); 
			
			if (this.zipCodeDataHandler.getZipCodes().containsKey(zip)) {
				this.zipCodeDataHandler.getZipCodes().get(zip).setPopulation(pop);;
			}  else {
				this.zipCodeDataHandler.getZipCodes().put(zip, new ZIPCode(zip, pop, null, null));
			}	
		}
		in.close();
	}
}
