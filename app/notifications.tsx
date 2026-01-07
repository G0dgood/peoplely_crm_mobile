import AnimatedHeader from "@/components/AnimatedHeader";
import Skeleton from "@/components/Skeleton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  Notification,
  useGetNotificationsByLineOfBusinessIdQuery,
  useMarkNotificationAsReadMutation,
} from "@/store/services/notificationApi";
import { teamMembersApi } from "@/store/services/teamMembersApi";
import { playNotificationSound } from "@/utils/sound";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

type NotificationSection = {
  title: string;
  items: Notification[];
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const styles = React.useMemo(
    () => createStyles(palette, colorScheme),
    [palette, colorScheme]
  );
  const { user } = useAuth();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // Animated scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;

  const { isConnected, disconnect: disconnectSocket, socket } = useSocket();


  const previousUnreadCount = useRef(0);
  const previousPathname = useRef<string | null>(null);
  const isNavigating = useRef(false);
  const lobId = user?.lineOfBusinessId || '';

  // Notifications integration
  const { data: notificationsData, refetch: refetchNotifications, isLoading, isFetching } = useGetNotificationsByLineOfBusinessIdQuery(lobId, {
    skip: !lobId,
    // pollingInterval: 30000 // Poll every 30 seconds as fallback
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const notifications = React.useMemo(() => notificationsData?.notifications || [], [notificationsData]);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    if (!lobId) return;
    try {
      setRefreshing(true);
      await refetchNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [lobId, refetchNotifications]);

  // Socket integration for Line of Business updates
  useEffect(() => {
    if (!socket || !user?.lineOfBusinessId) return;

    // Join the Line of Business room
    socket.emit("joinLineOfBusiness", user?.lineOfBusinessId);
    console.log(`Socket: Joined Line of Business room ${user?.lineOfBusinessId}`);

    // Listen for status list updates
    const handleStatusListUpdate = (data: unknown) => {
      console.log("Socket: Status list updated", data);
      // Invalidate RTK Query cache for statuses
      dispatch(teamMembersApi.util.invalidateTags(['Statuses']));
    };

    // Listen for notification updates
    const handleNotificationUpdate = () => {
      console.log("Socket: Notification updated");
      refetchNotifications();
    };

    socket.on("statusListUpdated", handleStatusListUpdate);
    socket.on("notificationUpdated", handleNotificationUpdate);

    return () => {
      socket.off("statusListUpdated", handleStatusListUpdate);
      socket.off("notificationUpdated", handleNotificationUpdate);
    };
  }, [socket, user?.lineOfBusinessId, dispatch, refetchNotifications]);

  // Track navigation to prevent sounds during page switches
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      isNavigating.current = true;
      previousPathname.current = pathname ?? null;
      setTimeout(() => {
        isNavigating.current = false;
      }, 1000);
    }
  }, [pathname]);

  // Detect new unread notifications and play sound (works even when panel is closed)
  // But don't play sounds during navigation
  useEffect(() => {
    // Don't play sounds if we're navigating between pages
    if (isNavigating.current) {
      // Update the count but don't play sounds
      const unreadNotifications = notifications.filter(n => !n.isRead);
      previousUnreadCount.current = unreadNotifications.length;
      return;
    }

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const unreadCount = unreadNotifications.length;

    // Play sound when new unread notifications arrive (count increases)
    if (unreadCount > previousUnreadCount.current) {
      // Play sound for each new notification
      const newNotifications = unreadNotifications.slice(previousUnreadCount.current);
      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          playNotificationSound('new_notification', 'notifications');
        }, index * 150); // Stagger sounds if multiple notifications arrive
      });
    }

    previousUnreadCount.current = unreadCount;
  }, [pathname, notifications]);


  // Group notifications for UI
  const groupedNotifications = useMemo(() => {
    const sections: NotificationSection[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const todayItems: Notification[] = [];
    const yesterdayItems: Notification[] = [];
    const olderItems: Notification[] = [];

    notifications.forEach(n => {
      const date = new Date(n.timestamp || n.createdAt || Date.now());
      if (isSameDay(date, today)) {
        todayItems.push(n);
      } else if (isSameDay(date, yesterday)) {
        yesterdayItems.push(n);
      } else {
        olderItems.push(n);
      }
    });

    if (todayItems.length > 0) sections.push({ title: "Today", items: todayItems });
    if (yesterdayItems.length > 0) sections.push({ title: "Yesterday", items: yesterdayItems });
    if (olderItems.length > 0) sections.push({ title: "Older", items: olderItems });

    return sections;
  }, [notifications]);

  const handleNotificationPress = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch { }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerButton2} />
        </View>

        {(isLoading || isFetching) ? (
          <View style={styles.sectionList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.card, i < 4 && styles.cardDivider]}>
                <Skeleton width={44} height={44} />
                <View style={styles.cardBody}>
                  <Skeleton width={"80%"} height={16} style={{ marginBottom: 8 }} />
                  <Skeleton width={80} height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : groupedNotifications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: palette.textSecondary }}>No notifications</Text>
          </View>
        ) : (
          groupedNotifications.map((section) => (
            <View key={section.title}>
              <Text style={styles.sectionHeading}>{section.title}</Text>
              <View style={styles.sectionList}>
                {section.items.map((item, index) => {
                  // Map API notification to UI props
                  // Assuming 'type' determines icon
                  let iconName: keyof typeof Ionicons.glyphMap = "notifications-outline";
                  let iconBg = palette.bgSecondary;

                  if (item.type === 'like') { iconName = "heart-outline"; iconBg = palette.paleBlushPink; }
                  else if (item.type === 'comment') { iconName = "chatbubble-outline"; iconBg = palette.paleCream; }
                  else if (item.type === 'follow') { iconName = "person-add-outline"; iconBg = palette.paleMintGreen; }

                  const time = new Date(item.timestamp || item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => handleNotificationPress(item.id)}
                      style={[
                        styles.card,
                        index < section.items.length - 1 && styles.cardDivider,
                        !item.isRead && { backgroundColor: palette.bgSecondary }
                      ]}
                    >
                      <View
                        style={[styles.iconWrap, { backgroundColor: iconBg }]}
                      >
                        <Ionicons
                          name={iconName}
                          size={20}
                          color={palette.interactiveSecondary}
                        />
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardMessage}>
                          {item.message}
                        </Text>
                        <Text style={styles.cardTime}>{time}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </Animated.ScrollView>
      <AnimatedHeader title="Notifications" scrollY={scrollY} />
    </SafeAreaView>
  );
}

const createStyles = (
  palette: (typeof Colors)["light"],
  colorScheme: "light" | "dark"
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 32,
      paddingTop: 16,
      gap: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 0,
      backgroundColor: palette.bgSecondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: palette.mediumGray,
    },
    headerButton2: {
      width: 40,
      height: 40,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
      color: palette.interactiveSecondary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    sectionHeading: {
      fontSize: 13,
      fontWeight: "700",
      color: palette.primaryLighter,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sectionList: {
      backgroundColor: palette.accentWhite,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 1,
    },
    card: {
      flexDirection: "row",
      gap: 16,
      paddingHorizontal: 18,
      paddingVertical: 20,
      alignItems: "center",
    },
    cardDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.offWhite2,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBody: {
      flex: 1,
      gap: 6,
    },
    cardMessage: {
      fontSize: 15,
      fontWeight: "600",
      color: palette.textPrimary,
      lineHeight: 21,
    },
    cardHighlight: {
      color: palette.interactivePrimary,
    },
    cardTime: {
      fontSize: 12,
      color: palette.primaryLighter,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });
