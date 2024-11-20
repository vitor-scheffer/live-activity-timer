import { StatusBar, View } from "react-native";
import useTimer from "../hooks/useTimer";
import { useState } from "react";
import RoundedButton from "../components/iconButton";
import CircularProgress from "../components/circularProgress";

export const PICKER_ITEMS = [
  {
    label: "5 Seconds",
    value: 5,
  },
  {
    label: "10 Seconds",
    value: 10,
  },
  {
    label: "15 Seconds",
    value: 15,
  },
  {
    label: "60 Seconds",
    value: 60,
  },
];

export default function Home() {
  const {
    play,
    pause,
    restart,
    reset,
    progress,
    isFinished,
    isPlaying,
    setLimitTime,
    value,
  } = useTimer();

  const handleValueChange = (itemValue: number) => {
    setLimitTime(itemValue);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        paddingHorizontal: 32,
      }}
    >
      <StatusBar barStyle={"light-content"} backgroundColor="#000" />
      <CircularProgress
        size={250}
        strokeWidth={6}
        progress={progress}
        circleColor="#16bbc73b"
        progressColor="#16bbc7"
        text={isFinished ? "Done!" : value}
        onLimitValueChange={(value: number) => handleValueChange(value)}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 40,
        }}
      >
        {isPlaying ? (
          <RoundedButton
            title="Pause"
            onPress={pause}
            tintColor={"#16bbc7"}
            bgColor={"#16bbc73b"}
          />
        ) : (
          <RoundedButton
            title="Play"
            onPress={play}
            tintColor={"#16bbc7"}
            bgColor={"#16bbc73b"}
          />
        )}

        {isPlaying ? (
          <RoundedButton
            title="Restart"
            onPress={restart}
            tintColor={"#d9e3e3"}
            bgColor={"#d9e3e327"}
          />
        ) : (
          <RoundedButton
            title="Close"
            onPress={reset}
            tintColor={"#c71916"}
            bgColor={"#c719163a"}
          />
        )}
      </View>
    </View>
  );
}
