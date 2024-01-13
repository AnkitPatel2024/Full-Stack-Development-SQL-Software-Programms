package edu.upenn.cit594;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.simple.parser.ParseException;

import edu.upenn.cit594.datamanagement.CSVZIPCovidReader;
import edu.upenn.cit594.datamanagement.JSONZIPCovidReader;
import edu.upenn.cit594.datamanagement.ZIPCovidReader;
import edu.upenn.cit594.datamanagement.ZIPPopulationReader;
import edu.upenn.cit594.datamanagement.ZIPPropertiesReader;
import edu.upenn.cit594.logging.Logger;
import edu.upenn.cit594.processor.Processor;
import edu.upenn.cit594.ui.UserInterface;
import edu.upenn.cit594.util.ZIPCodeDataHandler;

public class Main {
	
	public static void main(String[] args) throws FileNotFoundException, IOException, ParseException, java.text.ParseException {
		
		// initiating our singletons: Logger and ZIPCodeDataHandler
		// -----------------------------------------------------------------------------------------------
		// ZIPCodeDataHandler contains a HashMap of ZIPCode objects that will be populated by each reader.
		// It is important to ensure that that HashMap is unique, which is why we need a singleton.
		// -----------------------------------------------------------------------------------------------
		ZIPCodeDataHandler zipCodeDataHandler = ZIPCodeDataHandler.getInstance();
		Logger logger = Logger.getInstance();
		
		// Finding, and logging, our program's input arguments.
		HashMap<String, String> argMap = findArgs(args);
		if (argMap==null) {
			return;
		}
		String argLog= "";
		for (String arg: args) {
			argLog = argLog + " " + arg;
			argLog = argLog.strip();
		}
		if (argMap.containsKey("log")) {
			File file = logger.setOutputFile(argMap.get("log"));
			if (file==null) {
				return;
			}
		}
		logger.logEvent(argLog);
		
		// declaring the readers we will use
		ZIPCovidReader covidReader = null;
		ZIPPopulationReader popReader = null;
		ZIPPropertiesReader propReader = null;
		
		// Check if files are readable if they are provided in arguments. Then instantiate our readers appropriately.
		// covid file
		if (argMap.containsKey("covid")) {
			String covidFilePath = argMap.get("covid");
			File covidFile = new File(covidFilePath);
			if (!covidFile.exists() || !covidFile.canRead()) {
				String message = "Covid file argument doesn't exist or cannot be read. Please verify permissions. Exiting program.";
		    	UserInterface.displayErrorMessage(message);
		    	return;
			} else {
				// Extension of files check
				int index = covidFilePath.lastIndexOf('.');
				String extension = "";
			    if(index > 0) extension = covidFilePath.substring(index + 1);
			    if (extension.equals("csv")) {
			    	covidReader = new CSVZIPCovidReader(covidFile, zipCodeDataHandler);
			    } else if (extension.equals("json")) {
			    	covidReader = new JSONZIPCovidReader(covidFile, zipCodeDataHandler);
			    } else {
			    	String message = "Couldn't resolve extension. File extension for covid must be one of '.json', '.txt'. Exiting program.";
			    	UserInterface.displayErrorMessage(message);
			    	return;
			    }
			}
		}
		// population file
		if (argMap.containsKey("population")) {
			File populationFile = new File(argMap.get("population"));
			if (!populationFile.exists() || !populationFile.canRead()) {
				String message = "Population file argument doesn't exist or cannot be read. Please verify permissions. Exiting program.";
		    	UserInterface.displayErrorMessage(message);
		    	return;
			} else {
				popReader = new ZIPPopulationReader(populationFile, zipCodeDataHandler);
			}
		}
		// properties file
		if (argMap.containsKey("properties")) {
			File propertiesFile = new File(argMap.get("properties"));
			if (!propertiesFile.exists() || !propertiesFile.canRead()) {
				String message = "Properties file argument doesn't exist or cannot be read. Please verify permissions. Exiting program.";
		    	UserInterface.displayErrorMessage(message);
		    	return;
			} else {
				propReader = new ZIPPropertiesReader(propertiesFile, zipCodeDataHandler);
			}
		}
		
		// Instantiating processor and ui classes with correct dependencies.
		Processor processor = new Processor(covidReader, popReader, propReader, zipCodeDataHandler, logger);
		UserInterface ui = new UserInterface(processor, logger);
		
		ui.start();

	}

	public static HashMap<String, String> findArgs(String[] args) {
		HashMap<String, String> argMap = new HashMap<String, String>();
		String argRegex = "(^--(?<name>.+?)=(?<value>.+)$)";
		Pattern pattern = Pattern.compile(argRegex);
		Matcher matcher;
		for (int i = 0; i < args.length; i++) {
			matcher = pattern.matcher(args[i]);
			if (!matcher.find()) {
				UserInterface.displayErrorMessage("Argument " + args[i] + " is not a valid argument.");
				return null;
			} else {
				String key = matcher.group("name");
				if (!(key.equals("population") || key.equals("log") || key.equals("properties") || key.equals("covid"))) {
					UserInterface.displayErrorMessage("Argument " + key + " is not recognized.");
					return null;
				}
				if (argMap.containsKey(key)) {
					UserInterface.displayErrorMessage("Argument " + key + " is passed more than once.");
					return null;
				}
				argMap.put(key, matcher.group("value"));
			}
		}
		return argMap;
	}
}


