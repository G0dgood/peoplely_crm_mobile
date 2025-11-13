import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@/css/colorsIndex";

const OnboardingButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.btn_container}>
      <TouchableOpacity style={styles.btn1}>
        <Text style={styles.btn_one}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn1}
        // onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.btn_two}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingButton;

const styles = StyleSheet.create({
  btn1: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },

  btn_container: {
    bottom: Platform.OS === "ios" ? 30 : 30,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  btn_two: {
    color: colors.black,
    fontWeight: "bold",
    fontSize: 15,
  },
  btn_one: {
    fontWeight: "bold",
    fontSize: 15,
    color: colors.black,
  },
});
