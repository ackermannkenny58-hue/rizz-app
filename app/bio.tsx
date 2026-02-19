import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import ScreenHeader from "@/components/ScreenHeader";
import ResultCard from "@/components/ResultCard";
import LoadingDots from "@/components/LoadingDots";
import { apiRequest } from "@/lib/query-client";

const vibes = [
  { id: "chill", label: "Chill", icon: "coffee" as const },
  { id: "adventurous", label: "Adventurous", icon: "compass" as const },
  { id: "intellectual", label: "Intellectual", icon: "book" as const },
  { id: "creative", label: "Creative", icon: "edit-3" as const },
  { id: "ambitious", label: "Ambitious", icon: "trending-up" as const },
  { id: "funny", label: "Funny", icon: "smile" as const },
];

interface Bios {
  attractive: string;
  confident: string;
  funny: string;
}

export default function BioScreen() {
  const insets = useSafeAreaInsets();
  const [hobbies, setHobbies] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [bios, setBios] = useState<Bios | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!hobbies.trim() && !selectedVibe) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setBios(null);
    try {
      const res = await apiRequest("POST", "/api/generate-bio", {
        hobbies: hobbies.trim(),
        vibe: selectedVibe,
      });
      const data = await res.json();
      setBios(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [hobbies, selectedVibe]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fix My Bio" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What are your hobbies?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. gym, cooking, hiking, photography, travel"
            placeholderTextColor={Colors.dark.textMuted}
            value={hobbies}
            onChangeText={setHobbies}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.vibeSection}>
          <Text style={styles.inputLabel}>What's your vibe?</Text>
          <View style={styles.vibeGrid}>
            {vibes.map((vibe) => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <Pressable
                  key={vibe.id}
                  onPress={() => {
                    setSelectedVibe(isSelected ? null : vibe.id);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.vibeChip,
                    isSelected && {
                      borderColor: Colors.success,
                      backgroundColor: Colors.success + "15",
                    },
                  ]}
                >
                  <Feather
                    name={vibe.icon as any}
                    size={16}
                    color={isSelected ? Colors.success : Colors.dark.textMuted}
                  />
                  <Text
                    style={[
                      styles.vibeText,
                      isSelected && { color: Colors.success },
                    ]}
                  >
                    {vibe.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={generate}
          disabled={(!hobbies.trim() && !selectedVibe) || loading}
          style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={[Colors.success, "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.generateBtn,
              ((!hobbies.trim() && !selectedVibe) || loading) && { opacity: 0.5 },
            ]}
          >
            <Feather name="user" size={20} color="#fff" />
            <Text style={styles.generateText}>Generate Bios</Text>
          </LinearGradient>
        </Pressable>

        {loading && <LoadingDots />}

        {bios && (
          <View style={styles.results}>
            <ResultCard
              label="Attractive"
              text={bios.attractive}
              labelColor={Colors.primary}
            />
            <ResultCard
              label="Confident"
              text={bios.confident}
              labelColor={Colors.secondary}
            />
            <ResultCard
              label="Funny"
              text={bios.funny}
              labelColor={Colors.accent}
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
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  vibeSection: {
    gap: 8,
  },
  vibeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  vibeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  vibeText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.dark.textMuted,
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
