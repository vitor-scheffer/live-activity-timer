import { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from "react-native";

const { TimerWidgetModule, TimerServiceModule, TimerEventEmitter } = NativeModules;

const timerEventEmitter = new NativeEventEmitter(
  Platform.OS === "android" ? TimerServiceModule : TimerEventEmitter
);

const TIMER_UPDATE_INTERVAL = 32;

const useTimer = () => {
  const nativeModule =
    Platform.OS === "android" ? TimerServiceModule : TimerWidgetModule;
  const [limitTime, setLimitTime] = useState(120);
  const [elapsedTimeInMs, setElapsedTimeInMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startTime = useRef<number | null>(null);
  const pausedTime = useRef<number | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secondUnits = seconds % 10;
    const secondTens = Math.floor((seconds % 60) / 10);
    return `${minutes}:${secondTens}${secondUnits}`;
  };

  const value = formatTime(elapsedTimeInMs);
  const progress = (elapsedTimeInMs / (limitTime * 1000)) * 100;

  const startInterval = () => {
    intervalId.current = setInterval(() => {
      setElapsedTimeInMs(Date.now() - startTime.current!);
    }, TIMER_UPDATE_INTERVAL);
  };

  const removeInterval = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const play = useCallback(async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        return;
      }
    }

    setIsFinished(false);
    setIsPlaying(true);
    if (intervalId.current) {
      return;
    }

    if (!startTime.current) {
      startTime.current = Date.now();
    }

    if (pausedTime.current) {
      const elapsedSincePaused = Date.now() - pausedTime.current;
      startTime.current = startTime.current! + elapsedSincePaused;
      pausedTime.current = null;
      nativeModule.resumeTimer();
    } else {
      nativeModule.startLiveActivity(startTime.current / 1000, limitTime);
    }

    startInterval();
  }, [limitTime]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    removeInterval();
    if (startTime.current && !pausedTime.current) {
      pausedTime.current = Date.now();
      nativeModule.pauseTimer(pausedTime.current / 1000);
      setElapsedTimeInMs(pausedTime.current! - startTime.current!);
    }
  }, []);

  const restart = useCallback(() => {
    setIsFinished(false);
    setIsPlaying(false);
    removeInterval();

    setElapsedTimeInMs(0);
    startTime.current = Date.now();
    pausedTime.current = null;

    nativeModule.stopLiveActivity();

    nativeModule.startLiveActivity(startTime.current / 1000, limitTime);

    startInterval();

    setIsPlaying(true);
  }, [limitTime]);

  const reset = useCallback(() => {
    setIsFinished(false);
    setIsPlaying(false);
    removeInterval();
    startTime.current = null;
    pausedTime.current = null;
    setElapsedTimeInMs(0);
    nativeModule.stopLiveActivity();
  }, []);

  const finishTime = useCallback(() => {
    setIsPlaying(false);
    setIsFinished(true);
    removeInterval();
    startTime.current = null;
    pausedTime.current = null;
    setElapsedTimeInMs(0);
    nativeModule.timerEnded();
  }, []);

  useEffect(() => {
    const subscriptions = [
      timerEventEmitter.addListener("onPause", pause),
      timerEventEmitter.addListener("onResume", play),
      timerEventEmitter.addListener("onRestart", restart),
      timerEventEmitter.addListener("onReset", reset),
      timerEventEmitter.addListener("onFinish", finishTime),
    ];

    return () => {
      subscriptions.forEach((subscriptions) => subscriptions.remove());
    };
  }, [pause, reset, restart, play, finishTime]);

  return {
    play,
    pause,
    restart,
    reset,
    setLimitTime,
    isFinished,
    isPlaying,
    value,
    limitTime,
    progress,
  };
};

export default useTimer;
