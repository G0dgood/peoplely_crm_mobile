import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  GestureResponderEvent,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import PageTitle from "./PageTitle";

type CustomAlertProps = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (event: GestureResponderEvent) => void;
  onCancel?: (event: GestureResponderEvent) => void;
  hideCancel?: boolean;
  confirmLoading?: boolean;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title = "Alert",
  message = "",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  hideCancel = false,
  confirmLoading = false,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = createStyles(palette);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title ? <PageTitle title={title} /> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonRow}>
            {!hideCancel && (
              <TouchableOpacity
                style={styles.button}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <View style={styles.cancelButton}>
                  <Text
                    style={[
                      styles.buttonText,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={confirmLoading}
            >
              <View style={styles.confirmButton}>
                {confirmLoading ? (
                  <ActivityIndicator color={palette.statusError} />
                ) : (
                  <Text
                    style={[styles.buttonText, { color: palette.statusError }]}
                  >
                    {confirmText}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    container: {
      width: "100%",
      maxWidth: 400,
      padding: 24,
      backgroundColor: palette.accentWhite,
      gap: 16,
      borderWidth: 0.5,
      borderColor: palette.mediumGray,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: palette.textPrimary,
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.textSecondary,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 2,
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: palette.slateGray,
      backgroundColor: palette.mediumGray,
      paddingHorizontal: 15,
      paddingVertical: 6,
    },
    confirmButton: {
      borderWidth: 1,
      borderColor: palette.slateGray,
      backgroundColor: palette.mediumGray,
      paddingHorizontal: 15,
      paddingVertical: 6,
    },
  });
