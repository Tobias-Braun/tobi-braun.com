import { ref, computed } from 'vue'
import { strings } from '../utils/locale'
import type { Locale } from '../utils/locale'

/**
 * Module-level ref so all Vue islands on the same page share one reactive
 * locale state. Derived from the URL path — /en/* is English, everything
 * else is German. This works correctly with SSG because each locale has its
 * own pre-rendered HTML file.
 */
const _locale = ref<Locale>(
  typeof window !== 'undefined'
    ? (window.location.pathname.startsWith('/en') ? 'en' : 'de')
    : 'de',
)

export function useLocale() {
  const ui = computed(() => strings[_locale.value])
  function setLocale(l: Locale) { _locale.value = l }
  return { locale: _locale, ui, setLocale }
}
