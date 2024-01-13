package edu.upenn.cit594.util;

import java.util.HashMap;

public class ZIPCodeDataHandler {
	
	private HashMap<Integer, ZIPCode> zipCodes = new HashMap<Integer, ZIPCode>();
	
	private ZIPCodeDataHandler() {}
	
	private static ZIPCodeDataHandler instance = new ZIPCodeDataHandler();
	
	public static ZIPCodeDataHandler getInstance() { return instance; }
	
	public HashMap<Integer, ZIPCode> getZipCodes() {
		return this.zipCodes;
	}
	
}
