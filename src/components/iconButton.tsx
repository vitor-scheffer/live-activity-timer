import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Text
} from "react-native";

interface RoundedButtonProps extends TouchableOpacityProps {
  title: string;
  tintColor: string;
  bgColor: string;
}

const RoundedButton = ({ title, tintColor, bgColor, ...rest }: RoundedButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, {backgroundColor: bgColor}]} {...rest}>
      <Text style={{ fontSize: 10, fontWeight: 500, color: tintColor}}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RoundedButton;
