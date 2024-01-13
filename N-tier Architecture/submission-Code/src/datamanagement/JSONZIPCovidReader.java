package edu.upenn.cit594.datamanagement;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import edu.upenn.cit594.util.ZIPCode;
import edu.upenn.cit594.util.ZIPCodeDataHandler;

public class JSONZIPCovidReader extends ZIPCovidReader {

	public JSONZIPCovidReader(File file, ZIPCodeDataHandler zipCodeDataHandler) {
		super(file, zipCodeDataHandler);
	}

	@Override
	public void readCovidData() throws FileNotFoundException, IOException, ParseException, java.text.ParseException {
		FileReader fr = new FileReader(this.file);
		Object obj = new JSONParser().parse(fr);
		JSONArray JSONList = (JSONArray) obj;
		for (int i = 0; i < JSONList.size(); i++) {
			JSONObject JSONRecord = (JSONObject) JSONList.get(i);
			HashMap<String, Integer> data = new HashMap<String, Integer>();
			HashMap<String, HashMap<String, Integer>> covidData = new HashMap<String, HashMap<String, Integer>>();
			String[] labels = new String[]{"NEG", "POS", "deaths", "hospitalized", "partially_vaccinated", "fully_vaccinated", "boosted"};
			
			
			String date = ((String) JSONRecord.get("etl_timestamp")).substring(0,10);
			int zip = (int) (long) JSONRecord.get("zip_code"); 
			
			for (String label: labels) {
				if (JSONRecord.get(label)!=null) {
					data.put(label, (int) (long) JSONRecord.get(label));
				}
			}
			
			covidData.put(date, data);
			
			if (this.zipCodeDataHandler.getZipCodes().containsKey(zip)) {
				this.zipCodeDataHandler.getZipCodes().get(zip).getCovidData().put(date, data);
			}  else {
				this.zipCodeDataHandler.getZipCodes().put(zip, new ZIPCode(zip, 0, covidData, null));
			}
			
		}
		fr.close();
	}

}
