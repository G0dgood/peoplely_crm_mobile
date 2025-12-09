import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NOTE_STORAGE_KEY = "@dashboard_notes";

interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function NoteCard() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  const [notes, setNotes] = useState<Note[]>([]);

  // Load notes from storage on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem(NOTE_STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const handleOpenNotes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/modal/notes");
  };

  const getPreviewText = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={handleOpenNotes}
      activeOpacity={0.8}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteHeading}>MY NOTES</Text>
        <View style={styles.headerRight}>
          <Text style={styles.noteCount}>{notes.length}</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color={palette.textInverse}
            style={styles.chevronIcon}
          />
        </View>
      </View>
      <View style={styles.quoteRule} />

      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={32}
            color="rgba(255, 255, 255, 0.4)"
          />
          <Text style={styles.emptyStateText}>No notes yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap to add your first note
          </Text>
        </View>
      ) : (
        <View style={styles.notesPreview}>
          {notes.slice(0, 3).map((note) => (
            <View key={note.id} style={styles.previewItem}>
              <Text style={styles.previewText} numberOfLines={2}>
                {getPreviewText(note.content)}
              </Text>
            </View>
          ))}
          {notes.length > 3 && (
            <Text style={styles.moreNotesText}>
              +{notes.length - 3} more {notes.length - 3 === 1 ? "note" : "notes"}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (palette: (typeof Colors)["light"]) =>
  StyleSheet.create({
    noteCard: {
      padding: 24,
      position: "relative",
      backgroundColor: palette.mutedSageGreen,
      minHeight: 150,
    },
    noteHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    noteHeading: {
      color: palette.textInverse,
      fontSize: 12,
      letterSpacing: 1.2,
      fontWeight: "700",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    noteCount: {
      color: palette.textInverse,
      fontSize: 12,
      fontWeight: "600",
      opacity: 0.7,
    },
    chevronIcon: {
      opacity: 0.6,
    },
    quoteRule: {
      width: 36,
      height: 2,
      backgroundColor: palette.textInverse,
      marginVertical: 12,
      opacity: 0.5,
    },
    notesPreview: {
      gap: 12,
    },
    previewItem: {
      marginBottom: 8,
    },
    previewText: {
      color: palette.textInverse,
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.9,
    },
    moreNotesText: {
      color: palette.textInverse,
      fontSize: 12,
      fontWeight: "500",
      opacity: 0.7,
      marginTop: 4,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
      gap: 8,
    },
    emptyStateText: {
      color: "rgba(255, 255, 255, 0.6)",
      fontSize: 14,
      fontWeight: "600",
    },
    emptyStateSubtext: {
      color: "rgba(255, 255, 255, 0.5)",
      fontSize: 12,
      textAlign: "center",
    },
  });
