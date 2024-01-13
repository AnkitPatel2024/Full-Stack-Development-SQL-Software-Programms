package edu.upenn.cit594.logging;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import edu.upenn.cit594.ui.UserInterface;

public class Logger {
	
	private File file;
	private FileWriter writer = null;
	
	private Logger() {}
	
	private static Logger instance = new Logger();
	
	public static Logger getInstance() { return instance; }
	
	public void logEvent(String event) {
		event = String.valueOf(System.currentTimeMillis()) + " " + event + "\n";
		try {
			this.writer.write(event);
			this.writer.flush();
		} catch (IOException e1) {
			System.err.print(event);
		} catch (NullPointerException e2) {
			System.err.print(event);
		}
	}
	
	public File getFile() {
		return this.file;
	}
	
	public File setOutputFile(String filePath) throws IOException {
		this.file = new File(filePath);
		if (this.writer!=null) {
			this.writer.close();
		}
		this.writer = new FileWriter(this.file, true);
		this.file.createNewFile();
		if (!file.exists() || !file.canWrite()) {
			String message = "Log file doesn't exist or cannot be written to. Please verify permissions. Exiting program.";
	    	UserInterface.displayErrorMessage(message);
	    	return null;
		}
		return file;
	}
}
