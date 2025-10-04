'use client';

import React from 'react';
import styles from '../styles/Home.module.css';
console.log('join screener caller page');
// Define the shape of the props this component expects
interface JoinScreenProps {
  userID: string;
  setUserID: (id: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  handleJoin: (roomID: string) => void;
}

// A mock list of rooms - in a real app, this would come from an API
const availableRooms = ['General', 'Tech-Talk', 'Random'];

export default function JoinScreen({
  userID,
  setUserID,
  userName,
  setUserName,
  handleJoin,
}: JoinScreenProps) {
  const canJoin = userID && userName;

  return (
    <div className={styles.joinScreenContainer}>
      <h1 className={styles.title}>Join a Video Call</h1>
      <input
        type="text"
        placeholder="Enter User ID"
        value={userID}
        onChange={(e) => setUserID(e.target.value)}
        className={styles.inputField}
      />
      <input
        type="text"
        placeholder="Enter Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className={styles.inputField}
      />
      <div className={styles.roomList}>
        <p className={styles.roomLabel}>Select a room to join:</p>
        {availableRooms.map((roomID) => (
          <button
            key={roomID}
            onClick={() => handleJoin(roomID)}
            disabled={!canJoin}
            className={styles.roomButton}
            title={!canJoin ? 'Please enter a User ID and Name' : `Join room ${roomID}`}
          >
            Join {roomID}
          </button>
        ))}
      </div>
    </div>
  );
}