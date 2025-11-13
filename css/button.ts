// styles.js
import { StyleSheet } from "react-native";
import { colors } from "./colorsIndex";

export const button = StyleSheet.create({
  login_account: {
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 10,
    backgroundColor: colors.accent_green,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5, // for Android
  },

  login_account_text: {
    textAlign: "center",
    color: colors.white,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
});
