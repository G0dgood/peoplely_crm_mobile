import { useEffect } from "react";
import { Alert } from "react-native";

/**
 * Custom hook to handle API errors and display alert notifications in the mobile app.
 *
 * @param isError - Boolean indicating if an error occurred
 * @param error - The error object returned from the API
 * @param fallbackMessage - Default message to show if no specific error message is found
 */
export const useApiError = (
  isError: boolean,
  error: unknown,
  fallbackMessage: string = "An error occurred"
) => {
  useEffect(() => {
    if (!isError || !error) {
      return;
    }

    let message: string | undefined;

    if (typeof error === "string") {
      message = error;
    } else if (typeof error === "object" && error !== null) {
      const err = error as { data?: unknown; error?: unknown };
      const data = err.data;

      if (typeof data === "string") {
        message = data;
      } else if (Array.isArray(data) && data.length > 0) {
        const first = data[0] as { message?: unknown };
        if (typeof first?.message === "string") {
          message = first.message;
        }
      } else if (typeof data === "object" && data !== null) {
        const anyData = data as {
          message?: unknown;
          Message?: unknown;
          error?: unknown;
          Error?: unknown;
          errors?: Array<{ message?: unknown; Message?: unknown }>;
        };

        if (typeof anyData.message === "string") {
          message = anyData.message;
        } else if (typeof anyData.Message === "string") {
          message = anyData.Message;
        } else if (typeof anyData.error === "string") {
          message = anyData.error;
        } else if (typeof anyData.Error === "string") {
          message = anyData.Error;
        } else if (
          Array.isArray(anyData.errors) &&
          anyData.errors.length > 0
        ) {
          const firstErr = anyData.errors[0];
          if (typeof firstErr?.message === "string") {
            message = firstErr.message;
          } else if (typeof firstErr?.Message === "string") {
            message = firstErr.Message;
          }
        }
      }

      if (!message && typeof err?.error === "string") {
        message = err.error;
      }
    }

    Alert.alert("Error", message || fallbackMessage);
  }, [isError, error, fallbackMessage]);
};

export default useApiError;
