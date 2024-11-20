import { View, Text, Button } from "react-native";
import useTimer from "../hooks/useTimer";

export default function Home() {
  const { play, pause, restart, reset, value } = useTimer();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text style={{ fontSize: 34, fontWeight: 600, marginBottom: 32 }}>
        {value}
      </Text>
      <Button title="Iniciar timer" onPress={play} />
      <Button title="Pausar timer" onPress={pause} />
      <Button title="Retomar timer" onPress={restart} />
      <Button title="Encerrar timer" onPress={reset} />
    </View>
  );
}
