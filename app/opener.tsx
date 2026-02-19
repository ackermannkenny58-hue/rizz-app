import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import ScreenHeader from "@/components/ScreenHeader";
import ResultCard from "@/components/ResultCard";
import LoadingDots from "@/components/LoadingDots";
import { apiRequest } from "@/lib/query-client";

const platforms = [
  {
    id: "instagram",
    label: "Instagram",
    icon: "logo-instagram" as const,
    iconSet: "Ionicons" as const,
    color: Colors.platforms.instagram,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "logo-whatsapp" as const,
    iconSet: "Ionicons" as const,
    color: Colors.platforms.whatsapp,
  },
  {
    id: "dating",
    label: "Dating App",
    icon: "heart-multiple" as const,
    iconSet: "MaterialCommunityIcons" as const,
    color: Colors.platforms.dating,
  },
  {
    id: "inperson",
    label: "In Person",
    icon: "people" as const,
    iconSet: "Ionicons" as const,
    color: Colors.platforms.inperson,
  },
];

interface Openers {
  safe: string;
  funny: string;
  bold: string;
}

export default function OpenerScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [openers, setOpeners] = useState<Openers | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!selectedPlatform) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setOpeners(null);
    try {
      const res = await apiRequest("POST", "/api/generate-opener", {
        platform: selectedPlatform,
      });
      const data = await res.json();
      setOpeners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Get Opener" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Where are you starting the conversation?</Text>

        <View style={styles.platformGrid}>
          {platforms.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <Pressable
                key={platform.id}
                onPress={() => {
                  setSelectedPlatform(platform.id);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.platformCard,
                  isSelected && {
                    borderColor: platform.color,
                    backgroundColor: platform.color + "12",
                  },
                ]}
              >
                <View
                  style={[
                    styles.platformIcon,
                    { backgroundColor: platform.color + "20" },
                  ]}
                >
                  {platform.iconSet === "MaterialCommunityIcons" ? (
                    <MaterialCommunityIcons
                      name={platform.icon as any}
                      size={24}
                      color={platform.color}
                    />
                  ) : (
                    <Ionicons
                      name={platform.icon as any}
                      size={24}
                      color={platform.color}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.platformLabel,
                    isSelected && { color: platform.color },
                  ]}
                >
                  {platform.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: platform.color }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={generate}
          disabled={!selectedPlatform || loading}
          style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.generateBtn,
              (!selectedPlatform || loading) && { opacity: 0.5 },
            ]}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fff" />
            <Text style={styles.generateText}>Generate Openers</Text>
          </LinearGradient>
        </Pressable>

        {loading && <LoadingDots />}

        {openers && (
          <View style={styles.results}>
            <ResultCard
              label="Safe"
              text={openers.safe}
              labelColor={Colors.success}
            />
            <ResultCard
              label="Funny"
              text={openers.funny}
              labelColor={Colors.accent}
            />
            <ResultCard
              label="Bold"
              text={openers.bold}
              labelColor={Colors.primary}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.dark.textSecondary,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  platformCard: {
    width: "47%",
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    alignItems: "center",
    gap: 10,
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  platformLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.dark.textSecondary,
  },
  checkmark: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  generateText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  results: {
    gap: 14,
  },
});
