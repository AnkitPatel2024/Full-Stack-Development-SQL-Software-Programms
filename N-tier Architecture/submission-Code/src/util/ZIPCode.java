package edu.upenn.cit594.util;

import java.util.HashMap;
import java.util.LinkedList;

public class ZIPCode {
	
	private int zipCode;
	
	private int Population;
	
	private HashMap<String, HashMap<String, Integer>> covidData = new HashMap<String, HashMap<String, Integer>>();
	
	private LinkedList<String[]> properties;

	public ZIPCode(int zipCode, int population, HashMap<String, HashMap<String, Integer>> covidData, LinkedList<String[]> properties) {
		this.setZipCode(zipCode);
		this.setPopulation(population);
		this.setCovidData(covidData);
		this.setProperties(properties);
	}
	
	// zipCode
	public int getZipCode() {
		return zipCode;
	}

	public void setZipCode(int zipCode) {
		this.zipCode = zipCode;
	}

	// population
	public int getPopulation() {
		return Population;
	}

	public void setPopulation(int population) {
		Population = population;
	}

	// covidData
	public HashMap<String, HashMap<String, Integer>> getCovidData() {
		return covidData;
	}

	public void setCovidData(HashMap<String, HashMap<String, Integer>> covidData) {
		this.covidData = covidData;
	}

	// properties
	public LinkedList<String[]> getProperties() {
		return properties;
	}

	public void setProperties(LinkedList<String[]> properties) {
		if (properties==null) {
			this.properties = new LinkedList<String[]>();
		} else {
			this.properties = properties;
		}
	}
	
}
