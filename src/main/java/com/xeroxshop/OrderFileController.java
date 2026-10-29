
package com.xeroxshop;

import java.io.File;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.net.MalformedURLException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/orders")
public class OrderFileController {

    private static final Path UPLOAD_DIR =
            Paths.get("uploads").toAbsolutePath().normalize();

    private static final long MAX_FILE_SIZE =
            20L * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "doc", "docx", "png", "jpg", "jpeg");

    private final PrintOrderRepository orderRepository;
    private final OrderFileRepository fileRepository;
    private final DirectPrintService directPrintService;
    private final DocumentEnhancementService documentEnhancementService;

   public OrderFileController(
        PrintOrderRepository orderRepository,
        OrderFileRepository fileRepository,
        DirectPrintService directPrintService,
        DocumentEnhancementService documentEnhancementService) {

    this.orderRepository = orderRepository;
    this.fileRepository = fileRepository;
    this.directPrintService = directPrintService;
    this.documentEnhancementService = documentEnhancementService;
}

    // Upload a document to an existing order
    @SuppressWarnings("deprecation")
    @PostMapping(
            value = "/{orderId}/files",
            consumes = "multipart/form-data")
    public Map<String, Object> uploadFile(
            @PathVariable Long orderId,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Maximum file size is 20 MB");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Filename is required");
        }

        String safeFilename = Paths.get(
                originalFilename.replace("\\", "/"))
                .getFileName()
                .toString();

        int dot = safeFilename.lastIndexOf('.');
        String extension = "";

        if (dot >= 0 && dot < safeFilename.length() - 1) {
            extension = safeFilename.substring(dot + 1)
                    .toLowerCase(Locale.ROOT);
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Allowed file types: PDF, DOC, DOCX, PNG, JPG, JPEG");
        }

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"));

        String storageKey = UUID.randomUUID() + "." + extension;
        Path destination = UPLOAD_DIR.resolve(storageKey).normalize();

        if (!destination.startsWith(UPLOAD_DIR)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid filename");
        }

        try {
            Files.createDirectories(UPLOAD_DIR);

            Files.copy(
                    file.getInputStream(),
                    destination);
        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save uploaded file");
        }

        try {
            OrderFile orderFile = new OrderFile();
            orderFile.setOrder(order);
            orderFile.setOriginalFilename(safeFilename);
            orderFile.setStorageKey(storageKey);
            orderFile.setMimeType(file.getContentType());
            orderFile.setFileSizeBytes(file.getSize());

            OrderFile saved = fileRepository.save(orderFile);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("fileId", saved.getFileId());
            response.put("orderId", orderId);
            response.put("filename", saved.getOriginalFilename());
            response.put("fileSizeBytes", saved.getFileSizeBytes());

            return response;

        } catch (RuntimeException ex) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException ignored) {
                // Keep the original database error.
            }
            throw ex;
        }
    }

    // List all documents attached to an order
    @GetMapping("/{orderId}/files")
    public List<Map<String, Object>> getOrderFiles(
            @PathVariable Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Order not found");
        }

        return fileRepository.findByOrder_OrderId(orderId)
                .stream()
                .map(file -> {
                    Map<String, Object> details =
                            new LinkedHashMap<>();

                    details.put("fileId", file.getFileId());
                    details.put("orderId", orderId);
                    details.put("filename",
                            file.getOriginalFilename());
                    details.put("fileSizeBytes",
                            file.getFileSizeBytes());
                    details.put("storageKey",
                            file.getStorageKey());
                    details.put("mimeType",
                            file.getMimeType());
                    details.put("uploadedAt",
                            file.getUploadedAt());

                    return details;
                })
                .toList();
    }
    
    // Download a document attached to an order
    @GetMapping("/{orderId}/files/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long orderId,
            @PathVariable Long fileId) {

        OrderFile orderFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "File not found"));

        if (!orderFile.getOrder().getOrderId().equals(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "File not found for this order");
        }

        Path filePath = UPLOAD_DIR
                .resolve(orderFile.getStorageKey())
                .normalize();

        if (!filePath.startsWith(UPLOAD_DIR)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file path");
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stored file not found");
            }

            String contentType = orderFile.getMimeType();

            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" +
                                    orderFile.getOriginalFilename()
                                            .replace("\"", "") +
                                    "\"")
                    .body(resource);

        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not read stored file");
        }
    }
    
    @PostMapping("/{orderId}/files/{fileId}/print")
    public ResponseEntity<Map<String, String>> printOrderFile(
            @PathVariable Long orderId,
            @PathVariable Long fileId) {

        OrderFile orderFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "File not found"));

        if (orderFile.getOrder() == null
                || !orderFile.getOrder().getOrderId().equals(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "File not found for this order");
        }

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        if (!"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only paid orders can be printed");
        }

        String filename = orderFile.getOriginalFilename();
        if (filename == null
                || !filename.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Direct printing currently supports PDF files only");
        }

        Path pdfPath = UPLOAD_DIR
                .resolve(orderFile.getStorageKey())
                .normalize();

        if (!pdfPath.startsWith(UPLOAD_DIR)
                || !Files.isRegularFile(pdfPath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Stored PDF file not found");
        }

        directPrintService.printPdf(pdfPath);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "Print command sent to DNI Leaser");
        response.put("orderId", orderId.toString());
        response.put("fileId", fileId.toString());

        return ResponseEntity.ok(response);
    }
    
@PostMapping("/{orderId}/files/{fileId}/enhance")
public Map<String, Object> enhanceDocument(
        @PathVariable Long orderId,
        @PathVariable Long fileId) {

    OrderFile original = fileRepository.findById(fileId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "File not found"));

    if (original.getOrder() == null
            || !original.getOrder().getOrderId().equals(orderId)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "File not found for this order");
    }

    String filename = original.getOriginalFilename();
    if (filename == null
            || !filename.toLowerCase(Locale.ROOT)
                    .matches(".*\\.(png|jpg|jpeg)$")) {
        throw new ResponseStatusException(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Enhancement currently supports PNG, JPG and JPEG images only");
    }

    Path originalPath = UPLOAD_DIR
            .resolve(original.getStorageKey())
            .normalize();

    if (!originalPath.startsWith(UPLOAD_DIR)
            || !Files.isRegularFile(originalPath)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Original image not found");
    }

    Path enhancedPath = documentEnhancementService
            .enhanceImage(originalPath);

    try {
        String extension = filename.substring(filename.lastIndexOf('.') + 1)
                .toLowerCase(Locale.ROOT);

        String storageKey = UUID.randomUUID() + "." + extension;
        Path destination = UPLOAD_DIR.resolve(storageKey).normalize();

        if (!destination.startsWith(UPLOAD_DIR)) {
            throw new IOException("Invalid output path");
        }

        Files.move(enhancedPath, destination);

        OrderFile enhanced = new OrderFile();
        enhanced.setOrder(original.getOrder());
        enhanced.setOriginalFilename(
                "Enhanced - " + filename);
        enhanced.setStorageKey(storageKey);
        enhanced.setMimeType(original.getMimeType());
        enhanced.setFileSizeBytes(Files.size(destination));

        OrderFile saved = fileRepository.save(enhanced);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Enhanced document created successfully");
        response.put("originalFileId", original.getFileId());
        response.put("enhancedFileId", saved.getFileId());
        response.put("filename", saved.getOriginalFilename());

        return response;

    } catch (Exception ex) {
        throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Could not save enhanced document");
    }
}



}
