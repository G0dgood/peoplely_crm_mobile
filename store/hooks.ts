// Re-export typed hooks for convenience
export { useAppDispatch, useAppSelector } from "./index";

// Example usage:
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// 
// const MyComponent = () => {
//   const dispatch = useAppDispatch();
//   const user = useAppSelector((state) => state.auth.user);
//   const notifications = useAppSelector((state) => state.notification.notifications);
//   
//   return (...);
// };

