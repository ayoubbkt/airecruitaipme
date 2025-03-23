package com.recruitpme.cvservice.service;

import com.recruitpme.cvservice.config.StorageProperties;
import com.recruitpme.cvservice.entity.CVDocument;
import com.recruitpme.cvservice.exception.FileStorageException;
import com.recruitpme.cvservice.repository.CVDocumentRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class CVStorageService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private StorageProperties storageProperties;

    @Autowired
    private CVDocumentRepository cvDocumentRepository;



    public List<String> storeFiles(MultipartFile[] files) {
        List<String> fileIds = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                if (file.isEmpty()) {
                    throw new FileStorageException("Failed to store empty file");
                }

                String fileId = UUID.randomUUID().toString();
                String originalFilename = file.getOriginalFilename();
                String contentType = file.getContentType();

                // Store file in MinIO
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(storageProperties.getBucketName())
                                .object(fileId)
                                .stream(file.getInputStream(), file.getSize(), -1)
                                .contentType(contentType)
                                .build()
                );

                // Save document metadata in database
                CVDocument document = new CVDocument();
                document.setId(fileId);
                document.setOriginalFilename(originalFilename);
                document.setContentType(contentType);
                document.setSize(file.getSize());
                document.setUploadedAt(LocalDateTime.now());
                document.setAnalyzed(false);

                cvDocumentRepository.save(document);

                fileIds.add(fileId);

            } catch (Exception e) {
                throw new FileStorageException("Failed to store file " + file.getOriginalFilename(), e);
            }
        }

        return fileIds;
    }

    public Resource loadFileAsResource(String fileId) {
        try {
            // Check if file exists in database
            if (!cvDocumentRepository.existsById(fileId)) {
                throw new FileStorageException("File not found with id: " + fileId);
            }

            // Get file from MinIO
            GetObjectArgs getObjectArgs = GetObjectArgs.builder()
                    .bucket(storageProperties.getBucketName())
                    .object(fileId)
                    .build();

            // Return as resource
            Resource resource = new InputStreamResource(minioClient.getObject(getObjectArgs));

            return resource;

        } catch (Exception e) {
            throw new FileStorageException("Failed to load file " + fileId, e);
        }
    }
}