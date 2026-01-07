import { Stack } from "expo-router";
import React from "react";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "transparentModal",
        animation: "fade",
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
    </Stack>
  );
}
