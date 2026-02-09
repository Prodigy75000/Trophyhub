// components/trophies/TrophyListHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Styles
import { styles } from "../../styles/TrophyListHeader.styles";

export type TrophySortMode = "DEFAULT" | "NAME" | "RARITY" | "STATUS" | "DATE_EARNED";
export type SortDirection = "ASC" | "DESC";

type Props = {
  onBack: () => void;
  onSearch: (text: string) => void;
  sortMode: TrophySortMode;
  onSortChange: (mode: TrophySortMode) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: () => void;
};

// Moved outside to prevent re-creation
const SortOption = ({
  label,
  value,
  icon,
  currentMode,
  onSelect,
}: {
  label: string;
  value: TrophySortMode;
  icon: keyof typeof Ionicons.glyphMap;
  currentMode: TrophySortMode;
  onSelect: (m: TrophySortMode) => void;
}) => {
  const isSelected = currentMode === value;
  return (
    <TouchableOpacity
      style={[styles.optionRow, isSelected && styles.optionSelected]}
      onPress={() => onSelect(value)}
    >
      <View style={styles.itemRow}>
        <Ionicons
          name={icon}
          size={20}
          color={isSelected ? "#4da3ff" : "#888"}
          style={styles.itemIcon}
        />
        <Text
          style={[
            styles.optionText,
            isSelected && { color: "#4da3ff", fontWeight: "bold" },
          ]}
        >
          {label}
        </Text>
      </View>
      {isSelected && <Ionicons name="checkmark" size={20} color="#4da3ff" />}
    </TouchableOpacity>
  );
};

export default function TrophyListHeader({
  onBack,
  onSearch,
  sortMode,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
}: Props) {
  const insets = useSafeAreaInsets();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSortSelect = (mode: TrophySortMode) => {
    onSortChange(mode);
    setShowSortMenu(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* SEARCH BAR */}
        <View
          style={[styles.searchContainer, isSearchActive && styles.searchContainerActive]}
        >
          <Ionicons
            name="search"
            size={18}
            color={isSearchActive ? "#4da3ff" : "#666"}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search trophies..."
            placeholderTextColor="#666"
            style={styles.input}
            onChangeText={onSearch}
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => setIsSearchActive(false)}
            returnKeyType="search"
          />
        </View>

        {/* SORT BUTTON */}
        <TouchableOpacity
          onPress={() => setShowSortMenu(true)}
          style={[styles.iconBtn, sortMode !== "DEFAULT" && styles.iconBtnActive]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="swap-vertical"
            size={22}
            color={sortMode !== "DEFAULT" ? "#4da3ff" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* SORT MENU MODAL */}
      <Modal
        transparent
        visible={showSortMenu}
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortMenu(false)}>
          <View style={[styles.menuContainer, { top: insets.top + 60 }]}>
            <Text style={styles.menuHeader}>Sort Trophies</Text>

            <SortOption
              label="Default Order"
              value="DEFAULT"
              icon="list"
              currentMode={sortMode}
              onSelect={handleSortSelect}
            />
            <SortOption
              label="Rarity"
              value="RARITY"
              icon="diamond-outline"
              currentMode={sortMode}
              onSelect={handleSortSelect}
            />
            <SortOption
              label="Date Earned"
              value="DATE_EARNED"
              icon="calendar-outline"
              currentMode={sortMode}
              onSelect={handleSortSelect}
            />
            <SortOption
              label="Earned Status"
              value="STATUS"
              icon="checkbox-outline"
              currentMode={sortMode}
              onSelect={handleSortSelect}
            />
            <SortOption
              label="Name (A-Z)"
              value="NAME"
              icon="text-outline"
              currentMode={sortMode}
              onSelect={handleSortSelect}
            />

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                onSortDirectionChange();
                setShowSortMenu(false);
              }}
            >
              <View style={styles.itemRow}>
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color="white"
                  style={[
                    styles.itemIcon,
                    {
                      transform: [
                        { rotate: sortDirection === "ASC" ? "0deg" : "180deg" },
                      ],
                    },
                  ]}
                />
                <Text style={styles.optionText}>
                  {sortDirection === "ASC"
                    ? "Ascending (Low → High)"
                    : "Descending (High → Low)"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
