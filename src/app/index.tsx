import { View, Text, Button } from "react-native";
import useTimer from "../hooks/useTimer";
import { useState } from "react";
import CustomPicker from "../components/picker";
import RoundedButton from "../components/iconButton";

const PICKER_ITEMS = [
  {
    label: "5 segundos",
    value: 5,
  },
  {
    label: "10 segundos",
    value: 10,
  },
  {
    label: "15 segundos",
    value: 15,
  },
  {
    label: "20 segundos",
    value: 20,
  },
  {
    label: "60 segundos",
    value: 60,
  },
];

export default function Home() {
  const { play, pause, restart, reset, setLimitTime, value } = useTimer();
  const [selectedValue, setSelectedValue] = useState(60);

  const handleValueChange = (itemValue: number) => {
    setSelectedValue(itemValue);
    setLimitTime(itemValue);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 32,
      }}
    >
      <Text style={{ fontSize: 34, fontWeight: 600, marginBottom: 10}}>
        {value}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          marginBottom: 40,
        }}
      >
        <RoundedButton iconName="play" onPress={play} />
        <RoundedButton iconName="pause" onPress={pause} />
        <RoundedButton iconName="rotate-ccw" onPress={restart} />
        <RoundedButton iconName="x" onPress={reset} />
      </View>

      <Text
        style={{
          fontSize: 12,
          fontWeight: 300,
          marginBottom: 4,
          textAlign: "left",
          width: "100%",
        }}
      >
        Selecione um tempo limite
      </Text>

      <CustomPicker
        items={PICKER_ITEMS}
        onValueChange={(item) => handleValueChange(item)}
        selectedItem={selectedValue}
      />
    </View>
  );
}
