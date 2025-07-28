import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Storage keys
const ROLE_KEY = 'userRole';
const AUTH_KEY = 'isLoggedIn';
const USERS_KEY = 'users';
const USER_SESSION = 'currentUser';

export type UserRole = 'client' | 'designer';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

// Generate a unique ID for users
const generateId = (): string => Crypto.randomUUID();

// Hash password using SHA-256
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Set current user session
export const setUserSession = async (user: Omit<User, 'passwordHash'>) => {
  await AsyncStorage.setItem(USER_SESSION, JSON.stringify(user));
  await AsyncStorage.setItem(ROLE_KEY, user.role);
  await AsyncStorage.setItem(AUTH_KEY, 'true');
};

// Get current user session
export const getCurrentUser = async (): Promise<User | null> => {
  const userJson = await AsyncStorage.getItem(USER_SESSION);
  return userJson ? JSON.parse(userJson) : null;
};

export const getUserRole = async (): Promise<UserRole | null> => {
  const role = await AsyncStorage.getItem(ROLE_KEY) as UserRole | null;
  return role === 'client' || role === 'designer' ? role : null;
};

export const isLoggedIn = async (): Promise<boolean> => {
  const loggedIn = await AsyncStorage.getItem(AUTH_KEY);
  return loggedIn === 'true';
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove([ROLE_KEY, AUTH_KEY, USER_SESSION]);
};

export const registerUser = async (
  email: string, 
  password: string, 
  role: UserRole,
  userData?: Omit<Partial<User>, 'email' | 'passwordHash' | 'role' | 'id' | 'createdAt'>
): Promise<{ success: boolean; message: string; user?: Omit<User, 'passwordHash'> }> => {
  try {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
      ...userData,
    };

    const updatedUsers = [...users, newUser];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    // Don't include password hash in the returned user object
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return { 
      success: true, 
      message: 'Registration successful.',
      user: userWithoutPassword 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration.' };
  }
};

export const findUser = async (email: string): Promise<User | null> => {
  try {
    const usersRaw = await AsyncStorage.getItem(USERS_KEY);
    if (!usersRaw) return null;
    
    const users: User[] = JSON.parse(usersRaw);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

export const validateUser = async (
  email: string, 
  password: string, 
  role: UserRole
): Promise<{ isValid: boolean; user?: Omit<User, 'passwordHash'> }> => {
  try {
    const user = await findUser(email);
    if (!user) return { isValid: false };

    const inputHash = await hashPassword(password);
    const isValid = inputHash === user.passwordHash && user.role === role;
    
    if (isValid) {
      const { passwordHash, ...userWithoutPassword } = user;
      return { isValid: true, user: userWithoutPassword };
    }
    
    return { isValid: false };
  } catch (error) {
    console.error('Validation error:', error);
    return { isValid: false };
  }
};