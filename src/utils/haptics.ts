/**
 * Tactile Haptic & Vibration Engine
 * Provides physical tactile feedback via the Web Vibration API (navigator.vibrate)
 * when supported by mobile browsers and devices.
 */

export const isVibrationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
};

export const triggerVibration = (pattern: number | number[] = 25): boolean => {
  if (isVibrationSupported()) {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }
  return false;
};

interface HapticFeedbackFn {
  (pattern?: number | number[]): boolean;
  startPlaying: () => boolean;
  missionCompleted: () => boolean;
  challengeCompleted: () => boolean;
  tactileClick: () => boolean;
  buttonPress: () => boolean;
  radarPulse: () => boolean;
  missionComplete: () => boolean;
  subtleTap: () => boolean;
}

const baseHaptic: HapticFeedbackFn = ((pattern: number | number[] = 25): boolean => {
  return triggerVibration(pattern);
}) as HapticFeedbackFn;

baseHaptic.startPlaying = () => triggerVibration([45, 35, 95]);
baseHaptic.missionCompleted = () => triggerVibration([70, 40, 110, 50, 160]);
baseHaptic.challengeCompleted = () => triggerVibration([35, 30, 65]);
baseHaptic.tactileClick = () => triggerVibration(22);
baseHaptic.buttonPress = () => triggerVibration(30);
baseHaptic.radarPulse = () => triggerVibration([40, 30, 70]);
baseHaptic.missionComplete = () => triggerVibration([70, 40, 110, 50, 160]);
baseHaptic.subtleTap = () => triggerVibration(12);

export const hapticFeedback = baseHaptic;
