// src/components/SideMenu.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTrophy } from "../../providers/TrophyContext";
import { usePsnAuth } from "../hooks/auth/usePsnAuth";
import { styles } from "../styles/SideMenu.styles";
import LoginModal from "./LoginModal";
import XboxLoginButton from "./XboxLoginButton";

export default function SideMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 1. GET GLOBAL DATA (PSN + Xbox)
  const {
    user, // PSN User Object
    accountId, // PSN Account ID
    logout, // PSN Logout
    handleXboxLogin, // Xbox Login Handler
    xboxProfile, // Xbox User Object
    logoutXbox, // Xbox Logout
  } = useTrophy();

  // 2. PSN AUTH UI HANDLERS
  const { showLoginModal, setShowLoginModal, loginGuest, onLoginSuccess } = usePsnAuth();

  // Helpers
  const isPsnLoggedIn = !!(user || accountId);
  const isXboxLoggedIn = !!xboxProfile;

  // --- 🟢 FIX 1: RESTORE USERNAME & AVATAR ---
  // If 'user' (profile) isn't loaded yet, fallback to 'accountId' so we don't show "Guest"
  const psnName = user?.onlineId ?? accountId ?? "Guest Player";
  const psnAvatar = user?.avatarUrl ?? "https://i.imgur.com/6Cklq5z.png";
  const psnLevel = user?.trophyLevel ?? 1;

  // Xbox Data Fallbacks
  const xboxGamertag = xboxProfile?.gamertag ?? "Xbox Player";
  const xboxPic = xboxProfile?.gamerpic ?? null;

  // Handlers
  const handlePsnLogout = () => {
    Alert.alert("Sign Out PSN", "Disconnect from PlayStation Network?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const handleXboxLogout = () => {
    Alert.alert("Sign Out Xbox", "Disconnect from Xbox Live?", [
      { text: "Cancel", style: "cancel" },
      // Check if logoutXbox exists before calling it
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logoutXbox && logoutXbox(),
      },
    ]);
  };

  const navigateHome = () => router.navigate("/");

  return (
    <View style={styles.container}>
      {/* HEADER: PSN PROFILE (Primary) */}
      <LinearGradient
        colors={["#1e2535", "#0a0b0f"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: psnAvatar }} style={styles.avatar} />
            {/* Small Xbox Badge if both connected */}
            {isXboxLoggedIn && (
              <View
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  backgroundColor: "#107c10",
                  borderRadius: 10,
                  padding: 2,
                  borderWidth: 2,
                  borderColor: "#000",
                }}
              >
                <MaterialCommunityIcons name="microsoft-xbox" size={12} color="white" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username} numberOfLines={1}>
              {psnName}
            </Text>
            {isPsnLoggedIn ? (
              <View style={styles.levelBadge}>
                <MaterialCommunityIcons name="star" size={12} color="#ffd700" />
                <Text style={styles.levelText}>Level {psnLevel}</Text>
              </View>
            ) : (
              <Text style={styles.guestText}>Not synced</Text>
            )}
          </View>
        </View>

        {/* --- AUTH ACTIONS (Independent) --- */}
        <View style={styles.authButtonsContainer}>
          {/* 1. PSN ACTIONS */}
          {isPsnLoggedIn ? (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handlePsnLogout}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color="#ff8a80"
                style={styles.buttonIcon}
              />
              <Text style={styles.signOutText}>Sign Out PSN</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.webButton}
                onPress={() => setShowLoginModal(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="sony-playstation"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.webButtonText}>Sign In with PSN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={loginGuest}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#888"
                  style={styles.buttonIcon}
                />
                <Text style={styles.guestButtonText}>Guest Mode</Text>
              </TouchableOpacity>
            </>
          )}

          {/* 2. XBOX ACTIONS */}
          {isXboxLoggedIn ? (
            <TouchableOpacity
              style={[
                styles.xboxButton,
                { backgroundColor: "rgba(16, 124, 16, 0.15)", borderColor: "#107c10" },
              ]}
              onPress={handleXboxLogout}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {xboxPic ? (
                  <Image
                    source={{ uri: xboxPic }}
                    style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="microsoft-xbox"
                    size={20}
                    color="#107c10"
                    style={styles.buttonIcon}
                  />
                )}
                <Text style={[styles.xboxButtonText, { color: "#107c10" }]}>
                  {xboxGamertag}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={20}
                color="#107c10"
              />
            </TouchableOpacity>
          ) : (
            // 🟢 Xbox Login Button (Always visible if not logged in)
            <XboxLoginButton onSuccess={handleXboxLogin} />
          )}
        </View>
      </LinearGradient>

      {/* LOGIN MODAL (Hidden logic) */}
      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={onLoginSuccess}
      />

      {/* MENU NAVIGATION */}
      <ScrollView contentContainerStyle={styles.menuItems}>
        <Text style={styles.sectionLabel}>Menu</Text>
        <TouchableOpacity style={styles.menuRow} onPress={navigateHome}>
          <View style={[styles.iconBox, styles.iconBoxHome]}>
            <Ionicons name="home" size={20} color="#4da3ff" />
          </View>
          <Text style={styles.menuText}>Home</Text>
          <Ionicons name="chevron-forward" size={16} color="#444" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Settings</Text>
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.5}>
          <View style={[styles.iconBox, styles.iconBoxSettings]}>
            <Ionicons name="settings-outline" size={20} color="#888" />
          </View>
          <Text style={[styles.menuText, styles.menuTextInactive]}>App Preferences</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.footerRow}>
          <Text style={styles.versionText}>TrophyHub v0.9 (Beta)</Text>
        </View>
      </View>
    </View>
  );
}
