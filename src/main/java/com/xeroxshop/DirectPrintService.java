
package com.xeroxshop;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class DirectPrintService {

    private static final Path SUMATRA_PDF = Path.of(
        System.getProperty("user.home"),
        "AppData", "Local", "SumatraPDF", "SumatraPDF.exe"
    );

    private static final String PRINTER_NAME = "DNI Leaser";

    public void printPdf(Path pdfPath) {
        if (!Files.isRegularFile(SUMATRA_PDF)) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "SumatraPDF was not found at: " + SUMATRA_PDF
            );
        }

        if (!Files.isRegularFile(pdfPath)
                || !pdfPath.getFileName().toString()
                    .toLowerCase(java.util.Locale.ROOT)
                    .endsWith(".pdf")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only existing PDF files can be printed"
            );
        }

        Process process = null;

        try {
            process = new ProcessBuilder(
                SUMATRA_PDF.toString(),
                "-print-to", PRINTER_NAME,
                "-silent",
                pdfPath.toAbsolutePath().toString()
            )
                .redirectErrorStream(true)
                .start();

            boolean finished = process.waitFor(60, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new ResponseStatusException(
                    HttpStatus.GATEWAY_TIMEOUT,
                    "Printing command timed out"
                );
            }

            if (process.exitValue() != 0) {
                throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "SumatraPDF reported a printing error"
                );
            }

        } catch (IOException ex) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Could not start SumatraPDF"
            );
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Printing was interrupted"
            );
        }
    }
}
