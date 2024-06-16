import { AxiosError } from "axios";

/**
 * Handles an error from an API request.
 * @param reason The error to handle.
 */
export function handleError(reason: unknown): string {
  if (reason instanceof AxiosError) {
    const res: AxiosError = reason as AxiosError;
    switch (res.code) {
      case "ECONNABORTED":
        return "Request timed out";
      case "ENOTFOUND":
      case "ERR_BAD_REQUEST":
      case "CONFLICT":
        return "User not found or has no scan-able repositories";
      default:
        return res.message;
    }
  }

  return reason as string;
}
