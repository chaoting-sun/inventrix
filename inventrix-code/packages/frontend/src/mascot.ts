// Stub until the handheld mascot lands; that implementation replaces this file.
export const mascot = {
  happy(): void {},
  dance(): void {},
  setMessage(_text: string | null): void {},
  subscribe(_fn: () => void): () => void {
    return () => {};
  },
};
