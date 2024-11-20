import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircularProgressProps = {
  size: number;
  strokeWidth: number;
  progress: number;
  circleColor: string;
  progressColor: string;
  text?: string;
  textStyle?: object;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  circleColor,
  progressColor,
  text,
  textStyle,
}) => {
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (progress / 100) * circumference;

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
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>

      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
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
    fontWeight: 700,
    fontSize: 24,
  },
});

export default CircularProgress;
