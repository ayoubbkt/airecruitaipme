package com.recruitpme.userservice.service;

import com.recruitpme.userservice.dto.UserCreateDTO;
import com.recruitpme.userservice.dto.UserDTO;
import com.recruitpme.userservice.dto.UserUpdateDTO;
import org.springframework.data.domain.Page;


import java.util.List;


public interface UserService {
    
    List<UserDTO> getAllUsers();
    
    Page<UserDTO> getUsersPaginated(int page, int size);
    
    Page<UserDTO> searchUsers(String keyword, int page, int size);
    
    UserDTO getUserById(Long id);
    
    UserDTO getUserByEmail(String email);
    
    UserDTO createUser(UserCreateDTO userDto);
    
    UserDTO updateUser(Long id, UserUpdateDTO userDto);
    
    void deleteUser(Long id);
}