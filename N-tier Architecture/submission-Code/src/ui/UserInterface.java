package edu.upenn.cit594.ui;

import java.text.ParseException;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import edu.upenn.cit594.logging.Logger;
import edu.upenn.cit594.processor.LivableAreaKeyGetter;
import edu.upenn.cit594.processor.MarketValueKeyGetter;
import edu.upenn.cit594.processor.Processor;

public class UserInterface {
	
	protected Processor processor;
	protected Logger logger;
	protected Scanner in = new Scanner(System.in);
	
	// CONSTRUCTOR   
	public UserInterface(Processor processor, Logger logger) {
		this.processor = processor;
		this.logger = logger;
	}
	
	// PUBLIC METHODS
	public void start() throws ParseException {
		while (true) {
			printStartMenu();
			String input = requestUserInput(this.in, "Please enter your option, e.g. '1'.");
			while (input.length()!=1 || (!Character.isDigit(input.charAt(0))) || Character.getNumericValue(input.charAt(0)) < 0 || Character.getNumericValue(input.charAt(0)) > 7 ) {
				input = requestUserInput(this.in, "Please enter an integer between 0 and 7.");
			}
			if (input.equals("0")) {
				break;
			}
			switch (input) {
				case "1": handleSelectionOne();
						  break;
				case "2": handleSelectionTwo();
				  		  break;
				case "3": handleSelectionThree();
				  		  break;
				case "4": handleSelectionFour();
				  		  break;
				case "5": handleSelectionFive();
				  		  break;
				case "6": handleSelectionSix();
				  		  break;
				case "7": handleSelectionSeven();
				  		  break;
			}
		}
	}
	
	public static void displayErrorMessage(String message) {
		System.err.println("Error:" + " " + message);
		System.err.flush();
	}
	
	// PRIVATE HELPERS
	/**
	 * Prints the start menu for the user.
	 */
	private void printStartMenu() {
		System.out.println("");
		System.out.println("----------------------------");
		System.out.println("=== Philly Data Analyzer ===");
		System.out.println("----------------------------");
		System.out.println(" 0 -- Exit the Program.");
		System.out.println(" 1 -- Show available Data Sets.");
		System.out.println(" 2 -- Show total population for all ZIP Codes.");
		System.out.println(" 3 -- Show total vaccinations per Capita for each ZIP Code for the specified date.");
		System.out.println(" 4 -- Show average market value for properties in a specified ZIP Code.");
		System.out.println(" 5 -- Show average total livable area for properties in a specified ZIP Code.");
		System.out.println(" 6 -- Show total market value of properties, per capita, for a specified ZIP Code.");
		System.out.println(" 7 -- Show maximum hospitalization rate and average market value for list of specified ZIP Codes.");
		System.out.println("");
		System.out.flush();
	}
	
	/**
	 * Useful function to prompt for a user input.
	 * @param sc
	 * @param prompt
	 * @return
	 */
	private String requestUserInput(Scanner sc, String prompt) {
		System.out.println(prompt);
		System.out.print("> ");
		System.out.flush();
		String inputString;
		inputString = sc.nextLine();
		logger.logEvent(inputString);
		//logger.logEvent(inputString);
		return inputString;
	}
	
	/**
	 * Helper function to handle output display when user inputs 1
	 */
	private void handleSelectionOne() {
		printOutputBegin();
		TreeSet<String> files = processor.computeAvailableFiles();
		for (String file: files) {
			System.out.println(file);
			System.out.flush();
		}
		printOutputEnd();
	}
	
	/**
	 * Helper function to handle output display when user inputs 2
	 */
	private void handleSelectionTwo() {
		int result = processor.computeZipCodesPopulation();
		if (result==-1) {
			System.err.println("Error: a dataset necessary for this operation is not available.");
			System.err.flush();
			return;
		}
		printOutputBegin();
		System.out.println(result);
		System.out.flush();
		printOutputEnd();
	}
	
	/**
	 * Helper function to handle output display when user inputs 3
	 * @throws ParseException 
	 */
	private void handleSelectionThree() throws ParseException {
		String input = requestUserInput(this.in, "Which type of vaccination, partial or full?");
		while (!input.equalsIgnoreCase("full")&&!input.equalsIgnoreCase("partial")) {
			input = requestUserInput(this.in, "Please enter one of: partial/full.");
		}
		String dateInput = requestUserInput(this.in, "For which date? Please enter a date in the form 'YYYY-MM-DD'.");
		while(!dateInput.matches("\\d{4}-\\d{2}-\\d{2}")) {
			dateInput = requestUserInput(this.in, "Please enter a valid date in the form 'YYYY-MM-DD'?");
		}
		TreeMap<Integer, Double> treeMap = processor.computeZipCodesVaxRatesPerCapita(input, dateInput);
		if (treeMap==null) {
			System.err.println("Error: a dataset necessary for this operation is not available.");
			System.err.flush();
			return;
		}
		printOutputBegin();
		for (Map.Entry<Integer, Double> entry: treeMap.entrySet()) {
			Double value = entry.getValue();
			System.out.print(entry.getKey() + " ");
			System.out.printf("%.4f",value);
			System.out.println("");
		}
		if (treeMap.size()==0) {
			System.out.println(0);
		}
		printOutputEnd();
	}

	/**
	 * Helper function to handle output display when user inputs 4
	 */
	private void handleSelectionFour() {
		String input = zipCodeValidation();
		long result = processor.computeAverageValuePerZip(Integer.parseInt(input), new MarketValueKeyGetter());
		if (result==-1) {
			System.err.println("Error: a dataset necessary for this operation is not available.");
			System.err.flush();
			return;
		}
		printOutputBegin();
		System.out.println(result);
		printOutputEnd();	
	}
	
	/**
	 * Helper function to handle output display when user inputs 5
	 */
	private void handleSelectionFive() {
		String input = zipCodeValidation();
		long result = processor.computeAverageValuePerZip(Integer.parseInt(input), new LivableAreaKeyGetter());
		if (result==-1) {
			System.err.println("Error: a dataset necessary for this operation is not available.");
			System.err.flush();
			return;
		}
		printOutputBegin();
		System.out.println(result);
		printOutputEnd();	
	}
	    
	/**
	 * Helper function to handle output display when user inputs 6
	 */
	private void handleSelectionSix() {
		String input = zipCodeValidation();
		long result = processor.computeAverageMarketValuePerZipPerCapita(Integer.parseInt(input));
		if (result==-1) {
			System.err.println("Error: a dataset necessary for this operation is not available.");
			System.err.flush();
			return;
		}
		printOutputBegin();
		System.out.println(result);
		printOutputEnd();
	}
	
	/**
	 * Helper function to handle output display when user inputs 7
	 */
	private void handleSelectionSeven() {
		String input = requestUserInput(this.in, "Please enter a comma delimited list of zip codes.");
		String regex = "^(\\d+(, ?\\d+)*)?$";
		Pattern pattern = Pattern.compile(regex);
		Matcher matcher;
		matcher = pattern.matcher(input);
		while (!matcher.find()) {
			input = requestUserInput(this.in, "Invalid input. Please enter a comma delimited list of zip codes.");
			matcher = pattern.matcher(input);
		}
		TreeMap<Integer, Double[]> treeMap = processor.computeMethodSevenOutput(input);
		if (treeMap != null) {
			printOutputBegin();
			if (treeMap.size()==0) {
				System.out.println(0);
			} else {
				for (Map.Entry<Integer, Double[]> entry: treeMap.entrySet()) {
					Double hospRate = entry.getValue()[0];
					Integer avgMktvalue = entry.getValue()[1].intValue();
					System.out.print(entry.getKey() + " ");
					System.out.printf("%.4f",hospRate);
					System.out.println(" " + avgMktvalue);			
				}
			}
			printOutputEnd();
		} else {
			System.err.println("Error: a dataset necessary for this operation is not available.");
			System.err.flush();
			return;
		}
	}
	
	private void printOutputBegin() {
		System.out.println("BEGIN OUTPUT");
		System.out.flush();
	}
	
	private void printOutputEnd() {
		System.out.println("END OUTPUT");
		System.out.flush();
	}
	
	private String zipCodeValidation() {
		boolean valid;
		String input = requestUserInput(this.in, "Please enter a ZIP Code.");
		try {
			Integer.parseInt(input);
			valid = true;
		} catch (Exception e) {
			valid = false;
		}
		while (!valid) {
			input = requestUserInput(this.in, "Please enter a valid integer zip code.");
			try {
				Integer.parseInt(input);
				valid = true;
			} catch (Exception e) {
				valid = false;
			}
		}
		return input;
	}
	
}
