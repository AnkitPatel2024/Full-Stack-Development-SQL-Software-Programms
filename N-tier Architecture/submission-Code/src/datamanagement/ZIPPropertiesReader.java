package edu.upenn.cit594.datamanagement;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;

import edu.upenn.cit594.util.ZIPCode;
import edu.upenn.cit594.util.ZIPCodeDataHandler;

public class ZIPPropertiesReader {

	public File file;
	public ZIPCodeDataHandler zipCodeDataHandler;
	
	public ZIPPropertiesReader(File file, ZIPCodeDataHandler zipCodeDataHandler) {
		this.file = file;
		this.zipCodeDataHandler = zipCodeDataHandler;
	}

	public void readPropertiesData() throws IOException, ParseException {
		FileReader in = new FileReader(this.file);
		ArrayList<ArrayList<String>> rows = CSVLexer.lexString(in);
		
		// We get the index of the zip_code and etl_timestamp columns from the resulting lexed content.
		int zipIndex = rows.get(0).indexOf("zip_code");
		int marketValueIndex = rows.get(0).indexOf("market_value");
		int livableAreaIndex = rows.get(0).indexOf("total_livable_area");
		
		for (int i = 1; i < rows.size(); i++) {
			// We instantiate the objects we will populate for each zip code.
			// Retrieve the zip code and date 
			String zip = rows.get(i).get(zipIndex);
			if (zip != "") {
				int zipInt = Integer.parseInt(zip.substring(0, 5));
				String[] pair = new String[] {rows.get(i).get(marketValueIndex), 
						  rows.get(i).get(livableAreaIndex)};
				if (this.zipCodeDataHandler.getZipCodes().containsKey(zipInt)) {
					this.zipCodeDataHandler.getZipCodes().get(zipInt).getProperties().add(pair);
				}  else {
					this.zipCodeDataHandler.getZipCodes().put(zipInt, new ZIPCode(zipInt, 0, null, null));
					this.zipCodeDataHandler.getZipCodes().get(zipInt).getProperties().add(pair);
				}
			}
		}
		in.close();
	}
}
