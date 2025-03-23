package com.recruitpme.userservice.service;

import com.recruitpme.userservice.dto.UserCreateDTO;
import com.recruitpme.userservice.dto.UserDTO;
import com.recruitpme.userservice.dto.UserUpdateDTO;
import com.recruitpme.userservice.entity.User;
import com.recruitpme.userservice.exception.ResourceNotFoundException;
import com.recruitpme.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findByEnabledTrue();
        
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersPaginated(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findByEnabledTrue(pageRequest);
        
        return userPage.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsers(String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("lastName").ascending());
        Page<User> userPage = userRepository.searchUsers(keyword, pageRequest);
        
        return userPage.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        return convertToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        return convertToDTO(user);
    }

    @Override
    @Transactional
    public UserDTO createUser(UserCreateDTO userDto) {
        // Check if email already exists
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalStateException("Email already in use: " + userDto.getEmail());
        }
        
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setCompanyName(userDto.getCompanyName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setRole(userDto.getRole());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        return convertToDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UserUpdateDTO userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Check if email is being changed and if it's already in use
        if (userDto.getEmail() != null && !user.getEmail().equals(userDto.getEmail()) && 
            userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalStateException("Email already in use: " + userDto.getEmail());
        }
        
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        
        if (userDto.getFirstName() != null) {
            user.setFirstName(userDto.getFirstName());
        }
        
        if (userDto.getLastName() != null) {
            user.setLastName(userDto.getLastName());
        }
        
        if (userDto.getCompanyName() != null) {
            user.setCompanyName(userDto.getCompanyName());
        }
        
        if (userDto.getPhoneNumber() != null) {
            user.setPhoneNumber(userDto.getPhoneNumber());
        }
        
        if (userDto.getRole() != null) {
            user.setRole(userDto.getRole());
        }
        
        if (userDto.getEnabled() != null) {
            user.setEnabled(userDto.getEnabled());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        
        return convertToDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Soft delete by disabling the user
        user.setEnabled(false);
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setCompanyName(user.getCompanyName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        return dto;
    }
}