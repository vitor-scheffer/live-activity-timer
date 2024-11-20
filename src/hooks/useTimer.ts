import React, { useCallback, useEffect } from "react";
import { NativeEventEmitter, NativeModule, NativeModules } from "react-native";

const { TimerWidgetModule } = NativeModules;

const TimerEventEmitter = new NativeEventEmitter(
  NativeModules.TimerEventEmitter as NativeModule
);

const LIMIT_TIME = 10;

const useTimer = () => {
  const [elapsedTimeInMs, setElapsedTimeInMs] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const startTime = React.useRef<number | null>(null);
  const pausedTime = React.useRef<number | null>(null);

  const intervalId = React.useRef<NodeJS.Timeout | null>(null);

  const elapsedTimeInSeconds = Math.floor(elapsedTimeInMs / 1000);
  const secondUnits = elapsedTimeInSeconds % 10;
  const secondTens = Math.floor(elapsedTimeInSeconds / 10) % 6;
  const minutes = Math.floor(elapsedTimeInSeconds / 60);

  const value = `${minutes}:${secondTens}${secondUnits}`;

  const play = useCallback(() => {
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
      TimerWidgetModule.resume();
    } else {
      TimerWidgetModule.startLiveActivity(startTime.current / 1000, LIMIT_TIME);
    }

    intervalId.current = setInterval(() => {
      setElapsedTimeInMs(Date.now() - startTime.current!);
    }, 32);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    removeInterval();
    if (startTime.current && !pausedTime.current) {
      pausedTime.current = Date.now();
      TimerWidgetModule.pause(pausedTime.current / 1000);
      setElapsedTimeInMs(pausedTime.current! - startTime.current!);
    }
  }, []);

  const restart = useCallback(() => {
    setIsPlaying(false);
    removeInterval();

    setElapsedTimeInMs(0);
    startTime.current = Date.now();
    pausedTime.current = null;

    TimerWidgetModule.stopLiveActivity();

    TimerWidgetModule.startLiveActivity(startTime.current / 1000, LIMIT_TIME);

    intervalId.current = setInterval(() => {
      setElapsedTimeInMs(Date.now() - startTime.current!);
    }, 32);

    setIsPlaying(true);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    removeInterval();
    startTime.current = null;
    pausedTime.current = null;
    setElapsedTimeInMs(0);
    TimerWidgetModule.stopLiveActivity();
  }, []);

  const finishTime = useCallback(() => {
    setIsPlaying(false);
    removeInterval();
    startTime.current = null;
    pausedTime.current = null;
    setElapsedTimeInMs(0);
    TimerWidgetModule.timerEnded();
  }, []);

  useEffect(() => {
    const pauseSubscription = TimerEventEmitter.addListener("onPause", pause);
    const resumeSubscription = TimerEventEmitter.addListener("onResume", play);
    const restartSubscription = TimerEventEmitter.addListener(
      "onRestart",
      restart
    );
    const resetSubscription = TimerEventEmitter.addListener("onReset", reset);
    const finishTimeSubscription = TimerEventEmitter.addListener(
      "onFinish",
      finishTime
    );

    return () => {
      pauseSubscription.remove();
      resumeSubscription.remove();
      restartSubscription.remove();
      resetSubscription.remove();
      finishTimeSubscription.remove();
    };
  }, [pause, reset, restart, play, finishTime]);

  function removeInterval() {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }

  return {
    play,
    pause,
    restart,
    reset,
    finishTime,
    value,
    isPlaying,
  };
};

export default useTimer;
