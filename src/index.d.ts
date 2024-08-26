export {};

declare global {
  interface Window {
    onLoginSuccess?: () => void;
  }
}
