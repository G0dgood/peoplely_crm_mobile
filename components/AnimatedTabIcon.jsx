import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function AnimatedTabIcon({ name, color, focused = false }) {
  const barAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const barOpacity = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          height: 3,
          marginBottom: 4,
          backgroundColor: color,
          width: barWidth,
          opacity: barOpacity,
        }}
      />
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

export default AnimatedTabIcon;
