import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createModalStyles } from "./shared";

const NOTE_STORAGE_KEY = "@dashboard_notes";

interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const createStyles = (palette: typeof Colors.light) =>
  StyleSheet.create({
    ...createModalStyles(palette),
    subtitle: {
      fontSize: 14,
      color: palette.textSecondary,
      marginTop: 4,
    },
    notesList: {
      gap: 12,
      marginTop: 8,
    },
    noteItem: {
      padding: 16,
      backgroundColor: palette.offWhite,
      borderWidth: 1,
      borderColor: palette.mediumGray,
      marginBottom: 12,
    },
    noteItemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    noteDate: {
      fontSize: 11,
      fontWeight: "500",
      color: palette.textSecondary,
    },
    noteActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    noteContent: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.textPrimary,
      minHeight: 60,
    },
    noteInput: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.textPrimary,
      minHeight: 120,
      textAlignVertical: "top",
    },
    addNoteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      backgroundColor: palette.offWhite,
      borderWidth: 1,
      borderColor: palette.mediumGray,
      borderStyle: "dashed",
      marginBottom: 12,
      gap: 8,
    },
    addNoteButtonText: {
      fontSize: 15,
      color: palette.textSecondary,
      fontWeight: "500",
    },
    saveButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: palette.interactivePrimary,
    },
    saveButtonText: {
      color: palette.textInverse,
      fontSize: 12,
      fontWeight: "600",
    },
    deleteButton: {
      padding: 4,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: "600",
      color: palette.textSecondary,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: palette.textSecondary,
      textAlign: "center",
    },
  });

export default function NotesModal() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const newNoteInputRef = useRef<TextInput>(null);
  const saveTimeoutRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  // Load notes from storage on mount
  useEffect(() => {
    loadNotes();
  }, []);

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

  const saveNotes = async (notesToSave: Note[]) => {
    try {
      await AsyncStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(notesToSave));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleNoteChange = (noteId: string, text: string) => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, content: text, updatedAt: Date.now() }
          : note
      );

      // Clear existing timeout for this note
      if (saveTimeoutRefs.current[noteId]) {
        clearTimeout(saveTimeoutRefs.current[noteId]!);
      }

      // Auto-save after 1 second of no typing
      saveTimeoutRefs.current[noteId] = setTimeout(() => {
        saveNotes(updatedNotes);
      }, 1000);

      return updatedNotes;
    });
  };

  const handleSaveNote = (noteId: string) => {
    // Clear auto-save timeout
    if (saveTimeoutRefs.current[noteId]) {
      clearTimeout(saveTimeoutRefs.current[noteId]!);
      delete saveTimeoutRefs.current[noteId];
    }

    // Save immediately
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      const updatedNotes = notes.map((n) =>
        n.id === noteId ? { ...n, updatedAt: Date.now() } : n
      );
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setEditingNoteId(null);
      setEditingContent("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);

    // Clear timeout if exists
    if (saveTimeoutRefs.current[noteId]) {
      clearTimeout(saveTimeoutRefs.current[noteId]!);
      delete saveTimeoutRefs.current[noteId];
    }

    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingContent("");
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditingContent(note.content);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        inputRefs.current[noteId]?.focus();
      }, 100);
    }
  };

  const handleNewNoteFocus = () => {
    setIsCreatingNew(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNewNoteBlur = () => {
    if (newNoteContent.trim().length > 0) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setNewNoteContent("");
    }
    setIsCreatingNew(false);
  };

  const handleSaveNewNote = () => {
    if (newNoteContent.trim().length > 0) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setNewNoteContent("");
      setIsCreatingNew(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "rgba(0,0,0,0.4)" }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.container, { backgroundColor: palette.accentWhite }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>My Notes</Text>
            <Text style={styles.subtitle}>
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.notesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* New Note Input */}
            {isCreatingNew || newNoteContent.length > 0 ? (
              <View style={styles.noteItem}>
                <View style={styles.noteItemHeader}>
                  <Text style={styles.noteDate}>New Note</Text>
                  <View style={styles.noteActions}>
                    {newNoteContent.trim().length > 0 && (
                      <TouchableOpacity
                        onPress={handleSaveNewNote}
                        style={styles.saveButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setNewNoteContent("");
                        setIsCreatingNew(false);
                      }}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="close-outline"
                        size={16}
                        color={palette.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  ref={newNoteInputRef}
                  style={styles.noteInput}
                  value={newNoteContent}
                  onChangeText={setNewNoteContent}
                  onFocus={handleNewNoteFocus}
                  onBlur={handleNewNoteBlur}
                  placeholder="Start typing..."
                  placeholderTextColor={palette.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsCreatingNew(true);
                  newNoteInputRef.current?.focus();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.addNoteButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={palette.textSecondary}
                />
                <Text style={styles.addNoteButtonText}>Add a new note</Text>
              </TouchableOpacity>
            )}

            {/* Existing Notes */}
            {notes.map((note) => {
              const isEditing = editingNoteId === note.id;
              return (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteItemHeader}>
                    <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
                    <View style={styles.noteActions}>
                      {isEditing ? (
                        <>
                          {editingContent.trim().length > 0 && (
                            <TouchableOpacity
                              onPress={() => handleSaveNote(note.id)}
                              style={styles.saveButton}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => {
                              setEditingNoteId(null);
                              setEditingContent("");
                            }}
                            style={styles.deleteButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="close-outline"
                              size={16}
                              color={palette.textPrimary}
                            />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => handleEditNote(note.id)}
                            style={styles.deleteButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="create-outline"
                              size={16}
                              color={palette.textPrimary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteNote(note.id)}
                            style={styles.deleteButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color={palette.textPrimary}
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                  {isEditing ? (
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[note.id] = ref;
                      }}
                      style={styles.noteInput}
                      value={editingContent}
                      onChangeText={(text) => {
                        setEditingContent(text);
                        handleNoteChange(note.id, text);
                      }}
                      placeholder="Start typing..."
                      placeholderTextColor={palette.textSecondary}
                      multiline
                      textAlignVertical="top"
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleEditNote(note.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.noteContent}>{note.content}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {notes.length === 0 &&
              !isCreatingNew &&
              newNoteContent.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color={palette.textSecondary}
                  />
                  <Text style={styles.emptyStateText}>No notes yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Tap "Add a new note" to create your first note
                  </Text>
                </View>
              )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

