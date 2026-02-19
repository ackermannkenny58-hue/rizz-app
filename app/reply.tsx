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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import ScreenHeader from "@/components/ScreenHeader";
import ResultCard from "@/components/ResultCard";
import LoadingDots from "@/components/LoadingDots";
import { apiRequest } from "@/lib/query-client";

const tones = [
  { id: "smooth", label: "Smooth", color: Colors.tones.smooth, icon: "heart" as const },
  { id: "playful", label: "Playful", color: Colors.tones.playful, icon: "happy" as const },
  { id: "calm", label: "Calm", color: Colors.tones.calm, icon: "leaf" as const },
  { id: "savage", label: "Savage", color: Colors.tones.savage, icon: "flame" as const },
];

export default function ReplyScreen() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [selectedTone, setSelectedTone] = useState("smooth");
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustingIndex, setAdjustingIndex] = useState<number | null>(null);

  const generate = useCallback(async () => {
    if (!message.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setReplies([]);
    try {
      const res = await apiRequest("POST", "/api/generate-reply", {
        message: message.trim(),
        tone: selectedTone,
      });
      const data = await res.json();
      setReplies(data.replies || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [message, selectedTone]);

  const handleAdjust = useCallback(async (index: number, direction: "bolder" | "safer") => {
    setAdjustingIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiRequest("POST", "/api/adjust-reply", {
        reply: replies[index],
        direction,
      });
      const data = await res.json();
      setReplies((prev) => {
        const next = [...prev];
        next[index] = data.reply;
        return next;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAdjustingIndex(null);
    }
  }, [replies]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Generate Reply" />
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
          <Text style={styles.inputLabel}>Paste the message you received</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Hey, what are you up to tonight?"
            placeholderTextColor={Colors.dark.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.toneSection}>
          <Text style={styles.inputLabel}>Pick your tone</Text>
          <View style={styles.toneRow}>
            {tones.map((tone) => (
              <Pressable
                key={tone.id}
                onPress={() => {
                  setSelectedTone(tone.id);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.toneChip,
                  selectedTone === tone.id && {
                    borderColor: tone.color,
                    backgroundColor: tone.color + "15",
                  },
                ]}
              >
                <Ionicons
                  name={tone.icon}
                  size={16}
                  color={selectedTone === tone.id ? tone.color : Colors.dark.textMuted}
                />
                <Text
                  style={[
                    styles.toneText,
                    selectedTone === tone.id && { color: tone.color },
                  ]}
                >
                  {tone.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={generate}
          disabled={!message.trim() || loading}
          style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.generateBtn,
              (!message.trim() || loading) && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.generateText}>Generate Replies</Text>
          </LinearGradient>
        </Pressable>

        {loading && <LoadingDots />}

        {replies.length > 0 && (
          <View style={styles.results}>
            {replies.map((reply, i) => (
              <ResultCard
                key={`${i}-${reply.slice(0, 20)}`}
                label={`Option ${i + 1}`}
                text={reply}
                labelColor={tones.find((t) => t.id === selectedTone)?.color}
                onAdjust={(dir) => handleAdjust(i, dir)}
                isAdjusting={adjustingIndex === i}
              />
            ))}
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
    minHeight: 100,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  toneSection: {
    gap: 8,
  },
  toneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  toneText: {
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
