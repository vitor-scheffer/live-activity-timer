import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import Feather from "react-native-vector-icons/Feather"

type CustomPickerProps = {
  items: { label: string; value: number }[];
  selectedItem: string | number;
  onValueChange: (value: number) => void;
  style?: object;
  placeholder?: string;
};

const CustomPicker: React.FC<CustomPickerProps> = ({
  items,
  selectedItem,
  onValueChange,
  style,
  placeholder = "Select an option",
}) => {
  const [isModalVisible, setModalVisible] = React.useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleItemPress = (value: number) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: { label: string; value: number } }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleItemPress(item.value)}
    >
      <Text style={styles.itemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.selectedItemContainer}
        onPress={toggleModal}
      >
        <Text style={styles.selectedItemText}>
          {selectedItem
            ? items.find((i) => i.value === selectedItem)?.label
            : placeholder}
        </Text>
        <Feather name="chevron-down" color="#16bbc7"/>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  selectedItemContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "#16bbc73b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItemText: {
    fontSize: 14,
    color: "#16bbc7",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(87, 87, 87, 0.202)",
  },
  modalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.688)",
    padding: 20,
    borderRadius: 8,
    width: "100%",
    maxHeight: "40%",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#11ceeb4f",
  },
  itemText: {
    fontSize: 16,
    color: "#16bbc7",
  },
});

export default CustomPicker;
