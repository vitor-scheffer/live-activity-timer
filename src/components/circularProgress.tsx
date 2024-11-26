import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import CustomPicker from "./picker";
import { PICKER_ITEMS } from "../app";

type CircularProgressProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  circleColor: string;
  progressColor: string;
  text?: string;
  textStyle?: object;
  onLimitValueChange: (value: number) => void;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  circleColor,
  progressColor,
  text,
  textStyle,
  onLimitValueChange,
}) => {
  const [selectedValue, setSelectedValue] = useState(60);
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const effectiveProgress = Math.min(progress, 100);
  const offset = circumference - (effectiveProgress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        style={{ transform: [{ rotate: "-90deg" }] }}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={circleColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress > 100 ? 0 : offset}
          strokeLinecap="round"
        />
      </Svg>

      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}

      <View style={styles.pickerContainer}>
        <CustomPicker
          items={PICKER_ITEMS}
          onValueChange={(item) => {
            onLimitValueChange(item);
            setSelectedValue(item);
          }}
          selectedItem={selectedValue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 14,
  },
  text: {
    position: "absolute",
    fontWeight: "300",
    fontSize: 24,
    color: "#FFFFFF",
    top: "40%",
  },
  pickerContainer: {
    position: "absolute",
    top: "65%",
    alignItems: "center",
    width: "50%",
  },
});

export default CircularProgress;
