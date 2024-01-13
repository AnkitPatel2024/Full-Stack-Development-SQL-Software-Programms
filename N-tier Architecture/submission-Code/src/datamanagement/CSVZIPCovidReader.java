package edu.upenn.cit594.datamanagement;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import edu.upenn.cit594.util.ZIPCode;
import edu.upenn.cit594.util.ZIPCodeDataHandler;

public class CSVZIPCovidReader extends ZIPCovidReader {

	public CSVZIPCovidReader(File file, ZIPCodeDataHandler zipCodeDataHandler) {
		super(file, zipCodeDataHandler);
		
		
	}

	@Override
	public void readCovidData() throws IOException {
		// Lexing of CSV File below
		FileReader in = new FileReader(this.file);
		ArrayList<ArrayList<String>> rows = CSVLexer.lexString(in);
		
		// We get the index of the zip_code and etl_timestamp columns from the resulting lexed content.
		int zipIndex = rows.get(0).indexOf("zip_code");
		int dateIndex = rows.get(0).indexOf("etl_timestamp");
		
		// Creating the list of labels we will be extracting from the covid file
		String[] labels = new String[]{"NEG", "POS", "deaths", "hospitalized", "partially_vaccinated", "fully_vaccinated", "boosted"};

		
		for (int i = 1; i < rows.size(); i++) {
			// We instantiate the objects we will populate for each zip code.
			HashMap<String, Integer> data = new HashMap<String, Integer>();
			HashMap<String, HashMap<String, Integer>> covidData = new HashMap<String, HashMap<String, Integer>>();
			
			// Retrieve the zip code and date 
			int zip = Integer.parseInt(rows.get(i).get(zipIndex)); 
			String date = rows.get(i).get(dateIndex).substring(0, 10);
			
			// We put the data corresponding to above zip and date into our data hashmap
			for (String label: labels) {
				String valueString = rows.get(i).get(rows.get(0).indexOf(label));
				if (valueString != "") {
					data.put(label, Integer.parseInt(valueString));
				}
			}
			
			// And create an entry into our date/data hashmap
			covidData.put(date, data);
			if (this.zipCodeDataHandler.getZipCodes().containsKey(zip)) {
				this.zipCodeDataHandler.getZipCodes().get(zip).getCovidData().put(date, data);
			}  else {
				this.zipCodeDataHandler.getZipCodes().put(zip, new ZIPCode(zip, 0, covidData, null));
			}	
		}
		in.close();
	}

}
