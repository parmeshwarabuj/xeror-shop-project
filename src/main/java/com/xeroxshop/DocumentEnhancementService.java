
package com.xeroxshop;


import nu.pattern.OpenCV;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.CLAHE;
import org.opencv.imgproc.Imgproc;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SuppressWarnings("unused")
@Service
public class DocumentEnhancementService {

    private static volatile boolean openCvLoaded = false;

    private static synchronized void loadOpenCv() {
        if (!openCvLoaded) {
            OpenCV.loadLocally();
            openCvLoaded = true;
        }
    }

    public Path enhanceImage(Path originalPath) {

        // IMPORTANT: Load native OpenCV BEFORE creating any Mat objects.
        loadOpenCv();

        Mat source = null;
        Mat gray = null;
        Mat enhanced = null;
        Mat blurred = null;
        CLAHE clahe = null;

        Path enhancedPath = null;

        try {
            source = Imgcodecs.imread(originalPath.toString());

            if (source.empty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Could not read the uploaded image."
                );
            }

            gray = new Mat();
            enhanced = new Mat();
            blurred = new Mat();

            // Convert to grayscale for clearer document text.
            Imgproc.cvtColor(
                    source,
                    gray,
                    Imgproc.COLOR_BGR2GRAY
            );

            // Improve contrast in faded or unevenly lit documents.
            clahe = Imgproc.createCLAHE(
                    2.0,
                    new Size(8, 8)
            );

            clahe.apply(gray, enhanced);

            // Apply mild sharpening.
            Imgproc.GaussianBlur(
                    enhanced,
                    blurred,
                    new Size(0, 0),
                    1.0
            );

            Core.addWeighted(
                    enhanced, 1.35,
                    blurred, -0.35,
                    0,
                    enhanced
            );

            enhancedPath = originalPath.resolveSibling(
                    "enhanced-" + originalPath.getFileName()
            );

            if (!Imgcodecs.imwrite(
                    enhancedPath.toString(),
                    enhanced
            )) {
                throw new IOException(
                        "OpenCV could not save the enhanced image."
                );
            }

            return enhancedPath;

        } catch (ResponseStatusException ex) {
            deleteOutput(enhancedPath);
            throw ex;

        } catch (Exception ex) {
            deleteOutput(enhancedPath);

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Document enhancement failed: " + ex.getMessage(),
                    ex
            );

        } finally {
            if (source != null) source.release();
            if (gray != null) gray.release();
            if (enhanced != null) enhanced.release();
            if (blurred != null) blurred.release();
            if (clahe != null) clahe.clear();
        }
    }

    private void deleteOutput(Path path) {
        if (path != null) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
                // Do not hide the original error.
            }
        }
    }
}
