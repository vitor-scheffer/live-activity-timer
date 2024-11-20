import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";

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
      {/* Picker Header */}
      <TouchableOpacity style={styles.selectedItemContainer} onPress={toggleModal}>
        <Text style={styles.selectedItemText}>
          {selectedItem ? items.find((i) => i.value === selectedItem)?.label : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Modal for Item List */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%"
  },
  selectedItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
  },
  selectedItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    maxHeight: "60%",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 3,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#11ceeb4f",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    paddingVertical: 12,
    backgroundColor: "#11ceeb",
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default CustomPicker;
