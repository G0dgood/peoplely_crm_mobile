import { Stack } from "expo-router";
import React from "react";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="add-customer" />
      <Stack.Screen name="customer-details" />
      <Stack.Screen name="disposition" />
      <Stack.Screen name="sms" />
    </Stack>
  );
}
