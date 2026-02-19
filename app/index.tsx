import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const features = [
  {
    id: "reply",
    title: "Generate Reply",
    subtitle: "Get 3 smooth replies instantly",
    icon: "chatbubble-ellipses" as const,
    iconSet: "Ionicons" as const,
    gradient: [Colors.primary, Colors.secondary] as [string, string],
    route: "/reply" as const,
  },
  {
    id: "analyze",
    title: "Analyze Chat",
    subtitle: "Read the room like a pro",
    icon: "analytics" as const,
    iconSet: "Ionicons" as const,
    gradient: [Colors.secondary, "#4F46E5"] as [string, string],
    route: "/analyze" as const,
  },
  {
    id: "opener",
    title: "Get Opener",
    subtitle: "Perfect first message every time",
    icon: "lightning-bolt" as const,
    iconSet: "MaterialCommunityIcons" as const,
    gradient: [Colors.accent, Colors.primary] as [string, string],
    route: "/opener" as const,
  },
  {
    id: "bio",
    title: "Fix My Bio",
    subtitle: "Stand out from the crowd",
    icon: "user" as const,
    iconSet: "Feather" as const,
    gradient: [Colors.success, "#059669"] as [string, string],
    route: "/bio" as const,
  },
];

function FeatureIcon({
  iconSet,
  icon,
}: {
  iconSet: string;
  icon: string;
}) {
  const size = 28;
  const color = "#fff";
  if (iconSet === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  }
  if (iconSet === "Feather") {
    return <Feather name={icon as any} size={size} color={color} />;
  }
  return <Ionicons name={icon as any} size={size} color={color} />;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding + 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Ionicons name="flash" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>RizzUp</Text>
          </View>
          <Text style={styles.tagline}>Text smarter. Flirt better.</Text>
        </View>

        <View style={styles.grid}>
          {features.map((feature) => (
            <Pressable
              key={feature.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(feature.route)}
            >
              <LinearGradient
                colors={feature.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIconContainer}
              >
                <FeatureIcon iconSet={feature.iconSet} icon={feature.icon} />
              </LinearGradient>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={18} color={Colors.dark.textMuted} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.tipContainer}>
          <LinearGradient
            colors={["rgba(124, 58, 237, 0.15)", "rgba(255, 59, 111, 0.08)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipGradient}
          >
            <View style={styles.tipIconRow}>
              <Ionicons name="bulb" size={18} color={Colors.warning} />
              <Text style={styles.tipLabel}>Quick Tip</Text>
            </View>
            <Text style={styles.tipText}>
              Paste the exact message you received for the best AI-powered replies. The more context, the better the suggestion.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.textSecondary,
    marginLeft: 48,
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.textSecondary,
  },
  cardArrow: {
    position: "absolute" as const,
    top: 20,
    right: 20,
  },
  tipContainer: {
    marginTop: 28,
  },
  tipGradient: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.2)",
  },
  tipIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  tipLabel: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.warning,
  },
  tipText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
});
