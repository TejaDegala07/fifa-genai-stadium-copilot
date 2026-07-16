// =============================================================================
// useTranslation — Hook for accessing translations based on user language
// =============================================================================

import { useCallback } from 'react';
import { useUserStore } from '../store/useAppStore';
import { getTranslation, type TranslationKey } from '../i18n/translations';
import type { LanguageCode } from '../data/constants';

export function useTranslation() {
  const { user } = useUserStore();
  const lang = (user.language as LanguageCode) ?? 'en';

  const t = useCallback(
    (key: TranslationKey): string => getTranslation(lang, key),
    [lang]
  );

  return { t, lang };
}
