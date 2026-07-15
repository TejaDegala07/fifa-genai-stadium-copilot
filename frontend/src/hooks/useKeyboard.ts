import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyHandler;
}

export function useKeyboard(bindings: KeyBinding[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't fire when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const binding of bindings) {
        const keyMatch = event.key.toLowerCase() === binding.key.toLowerCase();
        const ctrlMatch = binding.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = binding.shift ? event.shiftKey : true;
        const altMatch = binding.alt ? event.altKey : true;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          binding.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindings]);
}
