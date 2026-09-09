import React, { createContext, useState, useContext, useEffect } from 'react';
import { getLogin } from '../services/loginService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Retrieve user from localStorage if available
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (username, password) => {
        try {
            // getLogin sends a POST request with credentials and returns the user object if successful
            const foundUser = await getLogin(username, password);
            
            if (foundUser) {
                // Determine appropriate role based on position from database or fallback to username
                let userRole = 'user';
                if (foundUser.position && foundUser.position.toLowerCase() === 'admin') {
                    userRole = 'admin';
                } else if (username.toLowerCase() === 'admin') {
                    userRole = 'admin';
                }

                const loggedInUser = { 
                    id: foundUser.memberID,
                    memberID: foundUser.memberID,
                    username: foundUser.member || username, 
                    role: userRole 
                };
                
                setUser(loggedInUser);
                localStorage.setItem('user', JSON.stringify(loggedInUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login verification failed:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
