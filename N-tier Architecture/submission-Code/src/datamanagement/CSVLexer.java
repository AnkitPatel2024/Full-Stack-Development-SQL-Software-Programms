package edu.upenn.cit594.datamanagement;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

public class CSVLexer {
	
	public static ArrayList<ArrayList<String>> lexString(FileReader in) throws IOException {
		ArrayList<ArrayList<String>> rows = new ArrayList<ArrayList<String>>();
		ArrayList<String> row = new ArrayList<String>();
		String temp = "";
		String str;
		String str2;
		BufferedReader br = new BufferedReader(in);
		
		while ((str=br.readLine()) != null) {
			str = str.replace("\r\n", "");
			str = str + "\n";
			boolean inQuotes = false;
			for (int i = 0; i < str.length(); i++) {
				if (inQuotes && i==str.length()-1) {
					str2 = br.readLine();
					str=str + str2 + "\n";
				}
				if (inQuotes) {
					if (str.charAt(i)=='"'	&& i==str.length()-1) {
						row.add(temp);
						rows.add(row);
						row = new ArrayList<String>();
						temp="";
					} else if (str.charAt(i)=='"' && str.charAt(i+1)!='"') {
						inQuotes=false;
					} else if (!(i==str.length()-1) && (str.charAt(i)=='"' && str.charAt(i+1)=='"')) {
						temp = temp + str.charAt(i);
						i++;
					} else {
						temp = temp + str.charAt(i);
					}
				} else {
					if (str.charAt(i)=='"') {
						inQuotes=true;
					} else if (str.charAt(i)==',') {
						row.add(temp);
						temp = "";
					} else if (str.charAt(i)=='\n') {
						row.add(temp);
						rows.add(row);
						row = new ArrayList<String>();
						temp="";
					} else {
						temp = temp + str.charAt(i);
					}
				}
			}
		}
		in.close();
		return rows;
	}
}

//String line;
//FileReader in = new FileReader(this.file);
//BufferedReader br = new BufferedReader(in);
//while((line = br.readLine()) != null) {
//"Header field 0,\"\"\",\"\"\"\",\"\"\"\"\"\",,\"\",fun, right?\",\"Still a header field (2 to be specific\"\r\n"
//+ "0.0,0.1,0.2\r\n"
//+ "1.0,1.1,1.2\r\n"
//+ "\"2.0, but only because it's zero indexed I think\",2.1,\"\"\"2.2\"\"\"\r\n"
//+ ""
