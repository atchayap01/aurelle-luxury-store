import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address } from '../types';
import { authAPI } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<boolean>;
  addAddress: (data: Omit<Address, 'id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  syncWishlist: (incomingItems?: string[]) => Promise<string[]>;
  isInWishlist: (productId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('aurelle_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aurelle_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  /**
   * Synchronize local guest wishlist items with the user's server-side database wishlist
   */
  const syncWishlist = useCallback(async (incomingItems?: string[]): Promise<string[]> => {
    const currentToken = localStorage.getItem('aurelle_auth_token');
    let itemsToSync: string[] = [];

    if (incomingItems && Array.isArray(incomingItems)) {
      itemsToSync = incomingItems;
    } else {
      try {
        const stored = localStorage.getItem('aurelle_guest_wishlist');
        if (stored) {
          itemsToSync = JSON.parse(stored);
        }
      } catch {
        itemsToSync = [];
      }
    }

    if (currentToken) {
      try {
        if (itemsToSync.length > 0) {
          const res = await authAPI.syncWishlist(itemsToSync);
          localStorage.removeItem('aurelle_guest_wishlist');
          
          setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, wishlist: res.wishlist };
            localStorage.setItem('aurelle_user', JSON.stringify(updated));
            return updated;
          });

          if (res.addedCount > 0) {
            success(
              'Wishlist Synchronized',
              `${res.addedCount} guest consideration${res.addedCount > 1 ? 's' : ''} saved to your Aurelle database profile.`
            );
          }
          return res.wishlist;
        } else {
          const data = await authAPI.getWishlist();
          setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, wishlist: data.wishlist };
            localStorage.setItem('aurelle_user', JSON.stringify(updated));
            return updated;
          });
          return data.wishlist;
        }
      } catch (err) {
        console.warn('Server-side wishlist synchronization failed:', err);
      }
    }

    return itemsToSync;
  }, [success]);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('aurelle_auth_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getMe();

      // Check if there are pending guest wishlist items to merge into the user's database record
      const guestWishlistRaw = localStorage.getItem('aurelle_guest_wishlist');
      if (guestWishlistRaw) {
        try {
          const guestItems = JSON.parse(guestWishlistRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const syncRes = await authAPI.syncWishlist(guestItems);
            userData.wishlist = syncRes.wishlist;
            localStorage.removeItem('aurelle_guest_wishlist');
          }
        } catch (syncErr) {
          console.warn('Error syncing guest wishlist on refresh:', syncErr);
        }
      }

      setUser(userData);
      localStorage.setItem('aurelle_user', JSON.stringify(userData));
    } catch (err) {
      console.warn('Failed to verify session:', err);
      // If unauthorized, clear invalid session
      localStorage.removeItem('aurelle_auth_token');
      localStorage.removeItem('aurelle_user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberMe = true): Promise<boolean> => {
    try {
      const data = await authAPI.login({ email, password, rememberMe });
      setToken(data.token);
      localStorage.setItem('aurelle_auth_token', data.token);

      let finalUser = data.user;

      // Automatically sync any guest wishlist items with server database upon login
      const guestWishlistRaw = localStorage.getItem('aurelle_guest_wishlist');
      if (guestWishlistRaw) {
        try {
          const guestItems = JSON.parse(guestWishlistRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const syncRes = await authAPI.syncWishlist(guestItems);
            if (syncRes.wishlist) {
              finalUser = { ...data.user, wishlist: syncRes.wishlist };
              localStorage.removeItem('aurelle_guest_wishlist');
              if (syncRes.addedCount > 0) {
                success(
                  'Wishlist Synchronized',
                  `${syncRes.addedCount} saved item${syncRes.addedCount > 1 ? 's' : ''} merged into your account.`
                );
              }
            }
          }
        } catch (e) {
          console.warn('Guest wishlist sync error upon login:', e);
        }
      }

      setUser(finalUser);
      localStorage.setItem('aurelle_user', JSON.stringify(finalUser));
      success('Welcome back', `Signed in as ${finalUser.name}`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Sign in failed. Please check credentials.';
      error('Authentication Error', msg);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    phone?: string
  ): Promise<boolean> => {
    try {
      const data = await authAPI.register({ name, email, password, confirmPassword, phone });
      setToken(data.token);
      localStorage.setItem('aurelle_auth_token', data.token);

      let finalUser = data.user;

      // Automatically sync guest wishlist items into the newly registered user's database record
      const guestWishlistRaw = localStorage.getItem('aurelle_guest_wishlist');
      if (guestWishlistRaw) {
        try {
          const guestItems = JSON.parse(guestWishlistRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const syncRes = await authAPI.syncWishlist(guestItems);
            if (syncRes.wishlist) {
              finalUser = { ...data.user, wishlist: syncRes.wishlist };
              localStorage.removeItem('aurelle_guest_wishlist');
              if (syncRes.addedCount > 0) {
                success(
                  'Wishlist Synchronized',
                  `${syncRes.addedCount} consideration${syncRes.addedCount > 1 ? 's' : ''} saved to your new account.`
                );
              }
            }
          }
        } catch (e) {
          console.warn('Guest wishlist sync error upon register:', e);
        }
      }

      setUser(finalUser);
      localStorage.setItem('aurelle_user', JSON.stringify(finalUser));
      success('Welcome to Aurelle', `Your account has been created.`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please check details.';
      error('Registration Error', msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('aurelle_auth_token');
    localStorage.removeItem('aurelle_user');
    setToken(null);
    setUser(null);
    success('Signed Out', 'You have been safely signed out.');
  };

  const updateProfile = async (data: { name?: string; phone?: string }): Promise<boolean> => {
    try {
      const res = await authAPI.updateProfile(data);
      setUser(res.user);
      localStorage.setItem('aurelle_user', JSON.stringify(res.user));
      success('Profile Updated', 'Your personal details have been saved.');
      return true;
    } catch (err: any) {
      error('Update Failed', err.response?.data?.error || 'Could not update profile.');
      return false;
    }
  };

  const addAddress = async (data: Omit<Address, 'id'>): Promise<boolean> => {
    try {
      const res = await authAPI.addAddress(data);
      if (user) {
        const updated = { ...user, addresses: res.addresses };
        setUser(updated);
        localStorage.setItem('aurelle_user', JSON.stringify(updated));
      }
      success('Address Saved', 'New delivery address added.');
      return true;
    } catch (err: any) {
      error('Address Error', err.response?.data?.error || 'Could not save address.');
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await authAPI.deleteAddress(id);
      if (user) {
        const updated = { ...user, addresses: res.addresses };
        setUser(updated);
        localStorage.setItem('aurelle_user', JSON.stringify(updated));
      }
      success('Address Removed', 'The address was removed.');
      return true;
    } catch (err: any) {
      error('Action Failed', err.response?.data?.error || 'Could not remove address.');
      return false;
    }
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!token) {
      // Guest wishlist support via localStorage
      try {
        const localWishlist = JSON.parse(localStorage.getItem('aurelle_guest_wishlist') || '[]');
        let updated: string[];
        let added = false;
        if (localWishlist.includes(productId)) {
          updated = localWishlist.filter((id: string) => id !== productId);
          success('Removed from Wishlist');
        } else {
          updated = [...localWishlist, productId];
          added = true;
          success('Saved to Curated Wishlist');
        }
        localStorage.setItem('aurelle_guest_wishlist', JSON.stringify(updated));
        if (user) setUser({ ...user, wishlist: updated });
        return added;
      } catch {
        return false;
      }
    }

    try {
      const res = await authAPI.toggleWishlist(productId);
      if (user) {
        const updated = { ...user, wishlist: res.wishlist };
        setUser(updated);
        localStorage.setItem('aurelle_user', JSON.stringify(updated));
      }
      if (res.added) {
        success('Curated Wishlist', 'Item added to your private selection.');
      } else {
        success('Curated Wishlist', 'Item removed from your selection.');
      }
      return res.added;
    } catch (err: any) {
      error('Wishlist Error', 'Could not update wishlist.');
      return false;
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!productId) return false;

    if (!token) {
      try {
        const localWishlist = JSON.parse(localStorage.getItem('aurelle_guest_wishlist') || '[]');
        if (!localWishlist.includes(productId)) {
          const updated = [...localWishlist, productId];
          localStorage.setItem('aurelle_guest_wishlist', JSON.stringify(updated));
          if (user) setUser({ ...user, wishlist: updated });
          success('Saved to Wishlist');
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    try {
      const res = await authAPI.addToWishlist(productId);
      if (user) {
        const updated = { ...user, wishlist: res.wishlist };
        setUser(updated);
        localStorage.setItem('aurelle_user', JSON.stringify(updated));
      }
      if (res.added) {
        success('Curated Wishlist', 'Saved to your account database.');
      }
      return res.added;
    } catch (err: any) {
      error('Wishlist Error', 'Could not save item to database.');
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!productId) return false;

    if (!token) {
      try {
        const localWishlist = JSON.parse(localStorage.getItem('aurelle_guest_wishlist') || '[]');
        const updated = localWishlist.filter((id: string) => id !== productId);
        localStorage.setItem('aurelle_guest_wishlist', JSON.stringify(updated));
        if (user) setUser({ ...user, wishlist: updated });
        success('Removed from Wishlist');
        return true;
      } catch {
        return false;
      }
    }

    try {
      const res = await authAPI.removeFromWishlist(productId);
      if (user) {
        const updated = { ...user, wishlist: res.wishlist };
        setUser(updated);
        localStorage.setItem('aurelle_user', JSON.stringify(updated));
      }
      success('Wishlist Updated', 'Item removed from your database profile.');
      return true;
    } catch (err: any) {
      error('Wishlist Error', 'Could not remove item from database.');
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    if (user?.wishlist) {
      return user.wishlist.includes(productId);
    }
    try {
      const localWishlist = JSON.parse(localStorage.getItem('aurelle_guest_wishlist') || '[]');
      return localWishlist.includes(productId);
    } catch {
      return false;
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        syncWishlist,
        isInWishlist,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
