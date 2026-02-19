import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface ResultCardProps {
  label: string;
  text: string;
  labelColor?: string;
  onAdjust?: (direction: "bolder" | "safer") => void;
  isAdjusting?: boolean;
}

export default function ResultCard({
  label,
  text,
  labelColor = Colors.primary,
  onAdjust,
  isAdjusting,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={[styles.labelBadge, { backgroundColor: labelColor + "20" }]}>
          <Text style={[styles.labelText, { color: labelColor }]}>{label}</Text>
        </View>
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={18}
            color={copied ? Colors.success : Colors.dark.textSecondary}
          />
        </Pressable>
      </View>
      <Text style={styles.resultText}>{text}</Text>
      {onAdjust && (
        <View style={styles.adjustRow}>
          <Pressable
            onPress={() => onAdjust("safer")}
            disabled={isAdjusting}
            style={({ pressed }) => [
              styles.adjustBtn,
              pressed && { opacity: 0.6 },
              isAdjusting && { opacity: 0.4 },
            ]}
          >
            <Feather name="shield" size={14} color={Colors.success} />
            <Text style={[styles.adjustText, { color: Colors.success }]}>Safer</Text>
          </Pressable>
          <Pressable
            onPress={() => onAdjust("bolder")}
            disabled={isAdjusting}
            style={({ pressed }) => [
              styles.adjustBtn,
              pressed && { opacity: 0.6 },
              isAdjusting && { opacity: 0.4 },
            ]}
          >
            <Ionicons name="flame" size={14} color={Colors.accent} />
            <Text style={[styles.adjustText, { color: Colors.accent }]}>Bolder</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  labelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  copyBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.text,
    lineHeight: 24,
  },
  adjustRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  adjustBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  adjustText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
});
