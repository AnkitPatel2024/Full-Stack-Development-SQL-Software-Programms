package edu.upenn.cit594.studenttests;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class BasicTests {

    public static boolean triedToExit = false;

    /* Student code should exit by returning from main(), not by calling System.exit */
    @Before
    public void blockExit() {
        System.setSecurityManager(new SecurityManager() {
            public void checkExit(int status) {
                SecurityException se = new SecurityException("Student code called System.exit");
                //se.printStackTrace();
                throw se;
            }

            public void checkPermission(java.security.Permission perm) {
            }
        });
    }

    @After
    public void resetExit() {
        System.setSecurityManager(null);
    }

    /*
     * Note no safety is provided. This routine is expected to fail with any error
     * or exception in the student code.
     */
    public String runMain(String[] args, String input) throws Exception {
        PrintStream realout = System.out;
        InputStream realin = System.in;

        /* Redirect stdin and stdout */
        ByteArrayOutputStream test_output = new ByteArrayOutputStream();
        ByteArrayInputStream test_input = new ByteArrayInputStream(input.getBytes());
        System.setOut(new PrintStream(test_output));
        System.setIn(test_input);

        /* run the student main method */
        edu.upenn.cit594.Main.main(args);

        /* Restore the actual input/output */
        System.setOut(realout);
        System.setIn(realin);

        return test_output.toString();
    }

    public List<String> extractResults(String output) throws Exception {
        BufferedReader output_reader = new BufferedReader(new StringReader(output));
        List<String> items = new ArrayList<>();

        int state = 0;
        String line;
        while ((line = output_reader.readLine()) != null) {
            if (state == 0 || state == 2) {
                if (line.matches("(> )?BEGIN OUTPUT")) {
                    state = 1;
                }
            } else if (state == 1) {
                if (line.equals("END OUTPUT")) {
                    state = 2;
                }
                else
                    items.add(line);
            }
        }
        if(state != 2) {
            System.err.println("No OUTPUT blocks detected");
            return null;
        }
        return items;
    }


    /* Application must be able to run basic operations in under 2 minutes */
    @Test(timeout = 120000)
    public void testSpeed() throws Exception {
        String results = runMain(
                new String[] { "--log=speed_test.log", "--covid=covid_data.json", "--properties=properties.csv", "--population=population.csv" }, "2\n0\n");
        //System.out.println("raw output:\n" + results +"end of raw output\n");
        List<String> lResults = extractResults(results);
        assertFalse("No assessable output detected", lResults == null);
        assertTrue("Expected exactly one line of output", lResults.size()==1);
        assertTrue("Out does not match format for operation 1", lResults.get(0).matches("^\\d+$"));
    }

    /* check for errors when running multiple times */
    @Test(timeout = 20000)
    public void testTwice() throws Exception {
        String result1 = runMain(new String[] { "--covid=covid_data.json", "--population=population.csv", "--log=small_test1.log" }, "3\nfull\n2021-11-05\n0\n");
        String result2 = runMain(new String[] { "--covid=covid_data.csv", "--properties=downsampled_properties.csv", "--population=population.csv" }, "3\nfull\n2021-11-05\n0\n");

        Set<String> sResult1 = new HashSet<>(extractResults(result1));
        Set<String> sResult2 = new HashSet<>(extractResults(result2));

        assertTrue("Repeated execution failed", sResult1.equals(sResult2));

        /* This only checks the rough line formatting, not the exact format and not the values
         * be sure to write more tests of your own
         */
        for(String line: sResult1)
        {
            assertTrue("bad line "+line, line.matches("^\\d+ (0|[\\d\\.]+)$"));
        }
    }
}
