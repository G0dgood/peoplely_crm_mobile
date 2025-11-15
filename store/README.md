# Redux Toolkit (RTK) Setup

This directory contains the Redux Toolkit store configuration and slices for the application.

## Structure

```
store/
├── index.ts              # Store configuration and typed hooks
├── hooks.ts              # Re-exported typed hooks
├── slices/
│   ├── authSlice.ts      # Authentication state
│   ├── dispositionSlice.ts # Disposition data management
│   ├── notificationSlice.ts # Notifications state
│   └── userSlice.ts      # User preferences and status
└── README.md             # This file
```

## Usage

### Basic Usage

```typescript
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout } from "@/store/slices/authSlice";

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogin = () => {
    dispatch(setCredentials({
      user: { id: "1", name: "John Doe", email: "john@example.com", role: "user" },
      token: "abc123"
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // Your component JSX
  );
};
```

### Available Slices

#### Auth Slice
- `setCredentials(user, token)` - Set user credentials
- `logout()` - Clear authentication
- `setLoading(boolean)` - Set loading state
- `updateUser(partialUser)` - Update user information

#### Disposition Slice
- `setDispositions(dispositions[])` - Set all dispositions
- `addDisposition(disposition)` - Add a new disposition
- `updateDisposition(id, updates)` - Update a disposition
- `markAsSynced(id)` - Mark a disposition as synced
- `syncAllPending()` - Sync all pending dispositions
- `removeDisposition(id)` - Remove a disposition

#### Notification Slice
- `addNotification(notification)` - Add a new notification
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `removeNotification(id)` - Remove a notification
- `setNotifications(notifications[])` - Set all notifications
- `clearNotifications()` - Clear all notifications

#### User Slice
- `setStatus(status)` - Set user status
- `setDarkMode(boolean)` - Toggle dark mode
- `setNotifications(boolean)` - Toggle notifications
- `setSoundEnabled(boolean)` - Toggle sound
- `updatePreferences(preferences)` - Update multiple preferences

## TypeScript Support

All slices are fully typed. The store exports:
- `RootState` - Type for the entire Redux state
- `AppDispatch` - Type for the dispatch function
- `useAppDispatch()` - Typed dispatch hook
- `useAppSelector()` - Typed selector hook

## Adding New Slices

1. Create a new file in `store/slices/`
2. Define your slice using `createSlice`
3. Export the reducer and actions
4. Add the reducer to `store/index.ts`
5. Use typed hooks in your components

Example:

```typescript
// store/slices/mySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MyState {
  data: string[];
}

const initialState: MyState = {
  data: [],
};

const mySlice = createSlice({
  name: "mySlice",
  initialState,
  reducers: {
    addData: (state, action: PayloadAction<string>) => {
      state.data.push(action.payload);
    },
  },
});

export const { addData } = mySlice.actions;
export default mySlice.reducer;
```

Then add to `store/index.ts`:

```typescript
import myReducer from "./slices/mySlice";

export const store = configureStore({
  reducer: {
    // ... other reducers
    mySlice: myReducer,
  },
});
```

