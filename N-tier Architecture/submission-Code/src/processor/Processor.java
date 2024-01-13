package edu.upenn.cit594.processor;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;

import org.json.simple.parser.ParseException;

import edu.upenn.cit594.datamanagement.ZIPCovidReader;
import edu.upenn.cit594.datamanagement.ZIPPopulationReader;
import edu.upenn.cit594.datamanagement.ZIPPropertiesReader;
import edu.upenn.cit594.logging.Logger;
import edu.upenn.cit594.util.ZIPCode;
import edu.upenn.cit594.util.ZIPCodeDataHandler;

public class Processor {

	protected ZIPCovidReader covidReader;
	protected ZIPPopulationReader popReader;
	protected ZIPPropertiesReader propReader;
	protected Logger logger;
	protected ZIPCodeDataHandler zipCodeDataHandler;
	
	protected TreeSet<String> fileTree;
	protected int zipCodesPopulation = -1;
	protected HashMap<String, TreeMap<Integer, Double>> zipCodeVaxPerCapita = new HashMap<String, TreeMap<Integer, Double>>();
	protected HashMap<Integer, Double> zipCodeHospPerCapita = new HashMap<Integer, Double>();
	protected HashMap<String, Long> averageValPerZip = new HashMap<String, Long>();
	protected HashMap<Integer, Long> averageValPerCapPerZip = new HashMap<Integer, Long>();
	  
	// CONSTRUCTOR
	public Processor(ZIPCovidReader covidReader, ZIPPopulationReader popReader, ZIPPropertiesReader propReader, ZIPCodeDataHandler zipCodeDataHandler, Logger logger) {
		this.covidReader = covidReader;
		this.popReader = popReader;
		this.propReader = propReader;
		this.logger = logger;
		this.zipCodeDataHandler = zipCodeDataHandler;
		this.fileTree = this.computeAvailableFiles();
		try {this.covidReader.readCovidData();logger.logEvent(this.covidReader.file.getName());} catch (NullPointerException | IOException | ParseException | java.text.ParseException e) {}
		try {this.popReader.readPopulationData();logger.logEvent(this.popReader.file.getName());} catch (NullPointerException | IOException | java.text.ParseException e) {}
		try {this.propReader.readPropertiesData();logger.logEvent(this.propReader.file.getName());} catch (NullPointerException | IOException | java.text.ParseException e) {}
	}
	
	// PUBLIC METHODS
	public TreeSet<String> computeAvailableFiles() {
		if (fileTree!=null) {
			return fileTree;
		}
		
		TreeSet<String> fileTree = new TreeSet<String>();
		if (this.covidReader!=null) {
			fileTree.add("covid");	
		}
		if (this.popReader!=null) {
			fileTree.add("population");	
		}
		if (this.propReader!=null) {
			fileTree.add("properties");	
		}
		
		this.fileTree = fileTree;
		
		return fileTree;
	}
	
	public int computeZipCodesPopulation() {
		// First, we check if dependencies are met. If not, we return null object.
		HashSet<String> dependencies = new HashSet<String>(Arrays.asList("population"));
		boolean dependenciesMet = checkDependencies(dependencies);
		
		if (!dependenciesMet) {
			return -1;
		}
		int totalPopulation = 0;
		if (zipCodesPopulation!=-1) {
			return zipCodesPopulation;
		}
		for (Map.Entry<Integer, ZIPCode> entry: zipCodeDataHandler.getZipCodes().entrySet()) {
			totalPopulation += entry.getValue().getPopulation();
		}
		return totalPopulation;
	}
	
	/**
	 * Function used to calculate vaccination rates per capita per zip code.
	 * 
	 */
	public TreeMap<Integer, Double> computeZipCodesVaxRatesPerCapita(String vaxType, String dateString) {
		// First, we check if dependencies are met. If not, we return null object.
		HashSet<String> dependencies = new HashSet<String>(Arrays.asList("covid", "population"));
		boolean dependenciesMet = checkDependencies(dependencies);
		
		if (!dependenciesMet) {
			return null;
		}
		
		// transform user input to proper field names
		if (vaxType.equals("partial")) {
			vaxType = "partially_vaccinated";
		} else {
			vaxType = "fully_vaccinated";
		}
		
		// create primary key for vaccination type + date. 
		// Useful to populate our zipCodeVaxPerCapita map for memoization
		String key = vaxType + dateString;
		
		// Check existence of precomputed input, return if available.
		if (this.zipCodeVaxPerCapita.containsKey(key)) {
			return this.zipCodeVaxPerCapita.get(key);
		}
		
		// Otherwise, calculate TreeMap to return.
		TreeMap<Integer, Double> returnMap = new TreeMap<Integer, Double>();
		for (Map.Entry<Integer, ZIPCode> entry: zipCodeDataHandler.getZipCodes().entrySet()) {
			int totalVaxd = 0;
			int population = entry.getValue().getPopulation();
			int zipCode = entry.getValue().getZipCode();
			if (population > 0) {
				HashMap<String, HashMap<String, Integer>> covidDataMap = entry.getValue().getCovidData();
				if (covidDataMap != null) {
					for (Map.Entry<String, HashMap<String, Integer>> covidData: covidDataMap.entrySet()) {
						if (covidData.getKey().equals(dateString)) {
							if (covidData.getValue().containsKey(vaxType)) {
								totalVaxd += covidData.getValue().get(vaxType);
							}
						}
					}
				}
			}
			if (totalVaxd > 0) {
				returnMap.put(zipCode, ((double) totalVaxd)/population);
			}
		}
		
		// Finally, store the return treemap in our memoization hashmap for future reference, and return treemap to caller.
		this.zipCodeVaxPerCapita.put(key, returnMap);
		return returnMap;
	}
	
	/**
	 * This method is called for main menu option 4 and 5 in UI
	 * 
	 * it take @param zip and type of String (market ) and calculates average market value for all the properties in that zip and then prints the result
	 * it take @param zip and type of String (Living) and calculates average Living area for all the properties in that zip and then prints the result
	 */
	public long computeAverageValuePerZip(int zip, KeyGetter keyGetter) {
		// First, we check if dependencies are met. If not, we return null object.
		HashSet<String> dependencies = new HashSet<String>(Arrays.asList("properties"));
		boolean dependenciesMet = checkDependencies(dependencies);
		
		if (!dependenciesMet) {
			return -1;
		}
		
		// create primary key 
		// Useful to populate map for memoization
		String key = zip + String.valueOf(keyGetter.getKey());
		
		// Check existence of precomputed input, return if available.
		if (this.averageValPerZip.containsKey(key)) {
			return this.averageValPerZip.get(key);
		}
		
		long totalValue = 0;
		long avgValue ;
		int noofProp = 0;
		LinkedList<String[]> propertiesInZip;
		
		ZIPCode zipGiven = this.zipCodeDataHandler.getZipCodes().get(zip);
		if (zipGiven==null) {
			return 0;
		}
		propertiesInZip = zipGiven.getProperties();
		Iterator<String[]> iterator = propertiesInZip.iterator();
		noofProp = propertiesInZip.size();

		if (noofProp  == 0 ) {			
			return 0;
		}

		double indVal =0;
		while(iterator.hasNext()) {
			String next = iterator.next()[keyGetter.getKey()];
			if (next.strip().equals("")) {
				noofProp--;
			} else {
				try {
					
					indVal = Double.parseDouble(next);
					totalValue += indVal;
				}
				catch (NumberFormatException e ) {} 	
			}
		}
		avgValue = totalValue / noofProp;
		this.averageValPerZip.put(key, avgValue);
		return avgValue;
	}
	
	/**
	 * This method is called for option 6 in Main menu in UI
	 * This method takes zip code as a parameter and calculates total market value per capita and prints out the result
	 * @param zip
	 */
	public long computeAverageMarketValuePerZipPerCapita(int zip) {
		// First, we check if dependencies are met. If not, we return null object.
		HashSet<String> dependencies = new HashSet<String>(Arrays.asList("properties", "population"));
		boolean dependenciesMet = checkDependencies(dependencies);
		
		if (!dependenciesMet) {
			return -1;
		}
		
		// create primary key 
		// Useful to populate map for memoization
		int key = zip;
		
		// Check existence of precomputed input, return if available.
		if (this.averageValPerCapPerZip.containsKey(key)) {
			return this.averageValPerCapPerZip.get(key);
		}
		
		long totalValue =0;
		int pop =0;
		ZIPCode zipGiven = this.zipCodeDataHandler.getZipCodes().get(zip);
		LinkedList<String[]> propertiesInZip ;

		if (zipGiven == null) {                			
			return 0;
		}

		pop = zipGiven.getPopulation();

		if (pop  == 0 ) { 			
			return 0;
		}

		double indVal;
		propertiesInZip =zipGiven.getProperties();
		Iterator<String[]> iterator = propertiesInZip.iterator();

		while (iterator.hasNext()) {
			try {
				indVal = Double.parseDouble(iterator.next()[0]);
				totalValue+= indVal;
			}
			catch (NumberFormatException e ) {}   
		}
		
		totalValue = totalValue/pop;
		
		this.averageValPerCapPerZip.put(key, totalValue);
		return totalValue;

	}
	
	public Double computeMaxHospRatePerCapita(int zip) {
		// create primary key 
		// Useful to populate map for memoization
		int key = zip;
		
		// Check existence of precomputed input, return if available.
		if (this.zipCodeHospPerCapita.containsKey(key)) {
			return this.zipCodeHospPerCapita.get(key);
		}
		
		ZIPCode zipCode = zipCodeDataHandler.getZipCodes().get(zip);
		HashMap<String, HashMap<String, Integer>> ZipCovidData =  zipCode.getCovidData();
		long maxHospitalized = 0;
		long hospitalized = 0;
		int population = zipCode.getPopulation();
		double maxHospRate = 0.0;
		
		if (population > 0 && ZipCovidData != null) {
			for (Map.Entry<String, HashMap<String, Integer>> entry: ZipCovidData.entrySet()) {
				if (entry.getValue().containsKey("hospitalized")) {
					hospitalized = entry.getValue().get("hospitalized");
					if (hospitalized > maxHospitalized) {
						maxHospitalized = entry.getValue().get("hospitalized");
					}
				}
			maxHospRate = ((double) maxHospitalized)/population;
			}
		}
		this.zipCodeHospPerCapita.put(key, maxHospRate);
		return maxHospRate;
	}
	
	public TreeMap<Integer, Double[]> computeMethodSevenOutput(String inputstring) {
		// First, we check if dependencies are met. If not, we return null object.
		HashSet<String> dependencies = new HashSet<String>(Arrays.asList("covid", "properties", "population"));
		boolean dependenciesMet = checkDependencies(dependencies);

		if (!dependenciesMet) {
			return null;
		}
		
		TreeMap <Integer, Double[]> zipValues = new TreeMap <Integer, Double[]>();
		Integer indZip=0;
		String[] indZips = inputstring.split(",");
		KeyGetter keyGetter = new MarketValueKeyGetter();

		for (int i=0; i<indZips.length; i++) {
			String zip = indZips[i].strip();
			if (!(zip.isEmpty()) || zip !=null){
				
				try {
					indZip= Integer.parseInt(zip);
					double maxHospRate = this.computeMaxHospRatePerCapita(indZip);
					double avgMarkVal = this.computeAverageValuePerZip(indZip, keyGetter);
					if (maxHospRate > 0 && avgMarkVal > 0) zipValues.put(indZip, new Double[] {maxHospRate, avgMarkVal});
				} catch (Exception e) {}		
			}
		}
		return zipValues;
	}	
	
	//PRIVATE HELPERS
	private boolean checkDependencies(HashSet<String> dependencies) {
		for (String dependency: dependencies) {
			if (!this.fileTree.contains(dependency)) {
				return false;
			}
		}
		return true;
	}
	
	
	
}
