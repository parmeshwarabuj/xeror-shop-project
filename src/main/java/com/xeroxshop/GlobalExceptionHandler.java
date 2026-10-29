
package com.xeroxshop;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(
            ResponseStatusException ex) {

        HttpStatus status = HttpStatus.valueOf(
                ex.getStatusCode().value());

        Map<String, String> body = Map.of(
                "status", String.valueOf(status.value()),
                "error", status.getReasonPhrase(),
                "message", ex.getReason() == null
                        ? "Request failed"
                        : ex.getReason()
        );

        return ResponseEntity.status(status).body(body);
    }
}
