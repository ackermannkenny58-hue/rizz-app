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
import LoadingDots from "@/components/LoadingDots";
import { apiRequest } from "@/lib/query-client";

interface AnalysisResult {
  interestLevel: number;
  investingMore: string;
  isDry: boolean;
  analysis: string;
  suggestion: string;
}

export default function AnalyzeScreen() {
  const insets = useSafeAreaInsets();
  const [chat, setChat] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async () => {
    if (!chat.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);
    try {
      const res = await apiRequest("POST", "/api/analyze-chat", {
        chat: chat.trim(),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [chat]);

  const getInterestColor = (level: number) => {
    if (level >= 7) return Colors.success;
    if (level >= 4) return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Analyze Chat" />
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
          <Text style={styles.inputLabel}>Paste your conversation</Text>
          <TextInput
            style={styles.textInput}
            placeholder={"e.g.\nMe: Hey how's it going?\nHer: Good hbu\nMe: Just chilling, you free tonight?"}
            placeholderTextColor={Colors.dark.textMuted}
            value={chat}
            onChangeText={setChat}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          onPress={analyze}
          disabled={!chat.trim() || loading}
          style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={[Colors.secondary, "#4F46E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.analyzeBtn,
              (!chat.trim() || loading) && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="analytics" size={20} color="#fff" />
            <Text style={styles.analyzeText}>Analyze Conversation</Text>
          </LinearGradient>
        </Pressable>

        {loading && <LoadingDots />}

        {result && (
          <View style={styles.resultSection}>
            <View style={styles.scoreCard}>
              <LinearGradient
                colors={[Colors.dark.surface, Colors.dark.surfaceLight]}
                style={styles.scoreGradient}
              >
                <Text style={styles.scoreLabel}>Interest Level</Text>
                <View style={styles.scoreRow}>
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: getInterestColor(result.interestLevel) },
                    ]}
                  >
                    {result.interestLevel}
                  </Text>
                  <Text style={styles.scoreDenom}>/10</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${result.interestLevel * 10}%`,
                        backgroundColor: getInterestColor(result.interestLevel),
                      },
                    ]}
                  />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.insightsGrid}>
              <View style={styles.insightCard}>
                <View style={[styles.insightIcon, { backgroundColor: Colors.secondary + "20" }]}>
                  <Ionicons name="scale" size={18} color={Colors.secondary} />
                </View>
                <Text style={styles.insightLabel}>Investing More</Text>
                <Text style={styles.insightValue}>{result.investingMore}</Text>
              </View>
              <View style={styles.insightCard}>
                <View
                  style={[
                    styles.insightIcon,
                    {
                      backgroundColor: result.isDry
                        ? Colors.danger + "20"
                        : Colors.success + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={result.isDry ? "water" : "flame"}
                    size={18}
                    color={result.isDry ? Colors.danger : Colors.success}
                  />
                </View>
                <Text style={styles.insightLabel}>Conversation</Text>
                <Text
                  style={[
                    styles.insightValue,
                    { color: result.isDry ? Colors.danger : Colors.success },
                  ]}
                >
                  {result.isDry ? "Dry" : "Engaging"}
                </Text>
              </View>
            </View>

            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Feather name="eye" size={16} color={Colors.primaryLight} />
                <Text style={styles.analysisLabel}>Analysis</Text>
              </View>
              <Text style={styles.analysisText}>{result.analysis}</Text>
            </View>

            <View style={styles.suggestionCard}>
              <LinearGradient
                colors={["rgba(255, 59, 111, 0.12)", "rgba(124, 58, 237, 0.08)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.suggestionGradient}
              >
                <View style={styles.suggestionHeader}>
                  <Ionicons name="bulb" size={18} color={Colors.warning} />
                  <Text style={styles.suggestionLabel}>Suggested Next Move</Text>
                </View>
                <Text style={styles.suggestionText}>{result.suggestion}</Text>
              </LinearGradient>
            </View>
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
    minHeight: 140,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  analyzeText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  resultSection: {
    gap: 14,
  },
  scoreCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  scoreGradient: {
    padding: 24,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 56,
    fontFamily: "Poppins_700Bold",
  },
  scoreDenom: {
    fontSize: 24,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.textMuted,
    marginLeft: 4,
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  insightsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.textMuted,
  },
  insightValue: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.dark.text,
  },
  analysisCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  analysisLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.primaryLight,
  },
  analysisText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  suggestionCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 111, 0.2)",
  },
  suggestionGradient: {
    padding: 16,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  suggestionLabel: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.warning,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.text,
    lineHeight: 22,
  },
});
