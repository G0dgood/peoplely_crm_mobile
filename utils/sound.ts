import { createAudioPlayer } from 'expo-audio';

export const playNotificationSound = async (soundName: string = 'new_notification', type: string = 'notifications') => {
  try {
    const player = createAudioPlayer(require('../assets/sounds/notification.mp3'));
    player.play();
    setTimeout(() => {
      try { player.release(); } catch {}
    }, 2500);
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};
