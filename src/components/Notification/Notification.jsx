import { useEffect } from 'react';
import styles from './Notification.module.css';

const Notification = ({ message, type = 'success', onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose}>✕</button>
    </div>
  );
};

export default Notification;