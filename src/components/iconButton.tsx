import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface RoundedButtonProps extends TouchableOpacityProps {
  iconName: string;
}

const RoundedButton = ({ iconName, ...rest }: RoundedButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} {...rest}>
      <Feather name={iconName} size={24} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});

export default RoundedButton;
