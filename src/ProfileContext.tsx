import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { Profile } from './types';
import { v4 as uuidv4 } from 'uuid';

interface ProfileContextType {
  activeProfile: Profile | null;
  profiles: Profile[];
  setActiveProfileId: (id: string) => void;
  addProfile: (name: string, color?: string, avatarUrl?: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  activeProfile: null,
  profiles: [],
  setActiveProfileId: () => { },
  addProfile: async () => { },
  updateProfile: async () => { },
  deleteProfile: async () => { }
});

export const useProfiles = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    return localStorage.getItem('activeProfileId') || null;
  });

  const profiles = useLiveQuery(() => db.profiles.toArray()) || [];

  // Init default profile if empty
  useEffect(() => {
    const initProfiles = async () => {
      const count = await db.profiles.count();
      if (count === 0) {
        const defaultProfile: Profile = {
          id: 'default',
          name: 'Faznaza',
          color: '#6750A4', // Primary brand color
          created_at: new Date().toISOString()
        };
        await db.profiles.add(defaultProfile);
        setActiveProfileId('default');
        localStorage.setItem('activeProfileId', 'default');
      } else {
        // Attempt to rename existing "Main User" to "Faznaza"
        const existingDefault = await db.profiles.get('default');
        if (existingDefault && existingDefault.name === 'Main User') {
          await db.profiles.update('default', { name: 'Faznaza' });
        }

        if (!activeProfileId) {
          const all = await db.profiles.toArray();
          if (all.length > 0) {
            setActiveProfileId(all[0].id);
            localStorage.setItem('activeProfileId', all[0].id);
          }
        }
      }
    };
    initProfiles();
  }, []);

  const handleSetProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem('activeProfileId', id);
  };

  const addProfile = async (name: string, color?: string, avatar_url?: string) => {
    const id = uuidv4();
    await db.profiles.add({
      id,
      name,
      color,
      avatar_url,
      created_at: new Date().toISOString()
    });
    handleSetProfile(id); // Switch to the new profile automatically
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    await db.profiles.update(id, updates);
  };

  const deleteProfile = async (id: string) => {
    await db.profiles.delete(id);
    // Delete habits associated with profile
    const habitsToDelete = await db.habits.where({ profile_id: id }).toArray();
    for (const h of habitsToDelete) {
      await db.habits.delete(h.id as string);
      await db.entries.where({ habit_id: h.id }).delete();
    }

    // Switch to another profile
    const remaining = await db.profiles.toArray();
    if (remaining.length > 0) {
      handleSetProfile(remaining[0].id);
    } else {
      // Re-initialize default
      await addProfile('Faznaza', '#6750A4');
    }
  };

  const activeProfile = profiles.find((p: Profile) => p.id === activeProfileId) || profiles[0] || null;

  return (
    <ProfileContext.Provider value={{
      activeProfile,
      profiles,
      setActiveProfileId: handleSetProfile,
      addProfile,
      updateProfile,
      deleteProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
