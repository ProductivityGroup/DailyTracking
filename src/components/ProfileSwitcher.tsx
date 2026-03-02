import React, { useState } from 'react';
import { useProfiles } from '../ProfileContext';
import { Plus, Check } from 'lucide-react';
import './ProfileSwitcher.css';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfileId, addProfile } = useProfiles();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      await addProfile(newName.trim());
      setNewName('');
      setIsAdding(false);
      setIsOpen(false);
    }
  };

  if (!activeProfile) return null;

  return (
    <div className="profile-switcher-container">
      <button
        className="profile-active-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch User Profile"
      >
        <div className="profile-avatar" style={{ backgroundColor: activeProfile.color || '#6750A4' }}>
          {activeProfile.name.charAt(0).toUpperCase()}
        </div>
        <span className="profile-name">{activeProfile.name}</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-list">
            {profiles.map(p => (
              <button
                key={p.id}
                className={`profile-item ${p.id === activeProfile.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveProfileId(p.id);
                  setIsOpen(false);
                }}
              >
                <div className="profile-avatar-small" style={{ backgroundColor: p.color || '#6750A4' }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span>{p.name}</span>
                {p.id === activeProfile.id && <Check size={16} className="check-icon" />}
              </button>
            ))}
          </div>

          <div className="profile-dropdown-actions">
            {!isAdding ? (
              <button className="add-profile-btn" onClick={() => setIsAdding(true)}>
                <Plus size={16} />
                <span>Add new user</span>
              </button>
            ) : (
              <form className="add-profile-form" onSubmit={handleAdd}>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Name..."
                  autoFocus
                  required
                />
                <button type="submit" className="save-btn">Add</button>
                <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}

      {isOpen && <div className="profile-backdrop" onClick={() => { setIsOpen(false); setIsAdding(false); }} />}
    </div>
  );
}
