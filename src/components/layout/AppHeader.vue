<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { strings } from '../../utils/locale'

const props = defineProps<{ locale: 'de' | 'en' }>()

const ui = computed(() => strings[props.locale])

const open = ref(false)
const langOpen = ref(false)

// Set after mount so the correct path is always used — avoids SSR/hydration
// mismatch where window is unavailable server-side and the ref would stay '/'.
const currentPath = ref('/')
onMounted(() => { currentPath.value = window.location.pathname })

const homeHref = computed(() => `/${props.locale}`)
const blogHref = computed(() => `/${props.locale}/blog`)
const aboutHref = computed(() => `/${props.locale}/about`)
const contactHref = computed(() => `/${props.locale}/about#contact`)

const links = computed(() => [
  { to: homeHref.value, label: ui.value.nav.home, exact: true },
  { to: blogHref.value, label: ui.value.nav.blog, exact: false },
  { to: aboutHref.value, label: ui.value.nav.about, exact: false },
])

const langOptions = [
  { value: 'de' as const, label: 'Deutsch' },
  { value: 'en' as const, label: 'English' },
]

/** Normalize trailing slash so `/en/blog/` and `/en/blog` both match `/en/blog/article`. */
const isActive = (to: string, exact: boolean) => {
  const t = to === '/' ? '/' : to.replace(/\/$/, '')
  const c = currentPath.value === '/' ? '/' : currentPath.value.replace(/\/$/, '')
  if (exact) return c === t
  return c === t || c.startsWith(t + '/')
}

function pickLang(l: 'de' | 'en') {
  langOpen.value = false
  const path = window.location.pathname
  const base = path.replace(/^\/(de|en)(\/|$)/, '$2') || '/'
  window.location.href = `/${l}${base === '/' ? '' : base}`
}

/** Close the lang dropdown when clicking outside its container. */
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.header__lang')) {
    langOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <header class="header" style="view-transition-name: site-header">
    <div class="header__inner">
      <a :href="homeHref" class="header__logo">Tobias Braun</a>

      <nav
        class="header__nav"
        :class="{ 'is-open': open }"
        aria-label="Navigation"
      >
        <a
          v-for="l in links"
          :key="l.to"
          :href="l.to"
          class="header__link"
          :class="{ 'is-active': isActive(l.to, l.exact) }"
          @click="open = false"
        >
          {{ l.label }}
        </a>
      </nav>

      <div class="header__actions">
        <!-- Language picker -->
        <div class="header__lang" role="group" aria-label="Language">
          <button
            class="header__lang-trigger"
            :aria-expanded="langOpen"
            aria-haspopup="listbox"
            @click.stop="langOpen = !langOpen"
          >
            <span class="material-symbols-outlined">translate</span>
            <span class="header__lang-code">{{ props.locale.toUpperCase() }}</span>
            <span class="material-symbols-outlined header__lang-chevron" :class="{ 'is-open': langOpen }">
              expand_more
            </span>
          </button>

          <Transition name="dropdown">
            <ul v-if="langOpen" class="header__lang-menu" role="listbox">
              <li
                v-for="opt in langOptions"
                :key="opt.value"
                class="header__lang-option"
                :class="{ 'is-active': props.locale === opt.value }"
                role="option"
                :aria-selected="props.locale === opt.value"
                @click="pickLang(opt.value)"
              >
                <span v-if="props.locale === opt.value" class="material-symbols-outlined">check</span>
                <span v-else class="header__lang-spacer" aria-hidden="true" />
                {{ opt.label }}
              </li>
            </ul>
          </Transition>
        </div>

        <a :href="contactHref" class="header__cta">{{ ui.nav.contact }}</a>
      </div>

      <button
        class="header__burger"
        :aria-expanded="open"
        :aria-label="ui.nav.openMenu"
        @click="open = !open"
      >
        <span class="material-symbols-outlined">{{
          open ? 'close' : 'menu'
        }}</span>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(251, 249, 244, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--surface-container-high);
}

.header__inner {
  @include container;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding-block: var(--space-md);

  @include md {
    padding-block: var(--space-lg);
  }
}

.header__logo {
  font-family: "Allura", cursive;
  font-size: 32px;
  font-weight: 400;
  color: var(--on-surface);
  line-height: 1;
}

.header__nav {
  display: none;
  gap: var(--space-lg);
  align-items: center;

  @include md {
    display: flex;
  }

  &.is-open {
    display: flex;
    position: absolute;
    inset: 100% 0 auto 0;
    flex-direction: column;
    background: var(--surface);
    border-bottom: 1px solid var(--surface-container-high);
    padding: var(--space-lg);
    align-items: stretch;
  }
}

.header__link {
  @extend %body-md;
  color: var(--on-surface-variant);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 2px solid transparent;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;

  &:hover {
    color: var(--on-surface);
    background: var(--surface-container-low);
    border-radius: var(--radius);
  }

  &.is-active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }
}

.header__actions {
  display: none;
  align-items: center;
  gap: var(--space-md);

  @include md {
    display: flex;
  }
}

// ── Language picker ──────────────────────────────────────────────────────────

.header__lang {
  position: relative;
}

.header__lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--on-surface-variant);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius);
  transition: color 0.2s, background-color 0.2s;

  .material-symbols-outlined {
    font-size: 18px;
  }

  &:hover {
    color: var(--on-surface);
    background: var(--surface-container-low);
  }
}

.header__lang-code {
  @extend %label-md;
  font-size: 12px;
  letter-spacing: 0.06em;
}

.header__lang-chevron {
  font-size: 16px !important;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.header__lang-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 130px;
  background: var(--surface);
  border: 1px solid var(--surface-container-high);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: var(--space-xs) 0;
}

.header__lang-option {
  @extend %body-md;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  color: var(--on-surface-variant);
  transition: background-color 0.15s, color 0.15s;

  .material-symbols-outlined {
    font-size: 16px;
    color: var(--primary);
  }

  &:hover {
    background: var(--surface-container-low);
    color: var(--on-surface);
  }

  &.is-active {
    color: var(--on-surface);
    font-weight: 600;
  }
}

.header__lang-spacer {
  display: inline-block;
  width: 16px;
}

// Dropdown enter/leave transition
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// ── CTA ─────────────────────────────────────────────────────────────────────

.header__cta {
  @extend %label-md;
  background: radial-gradient(ellipse at 0% 100%, #36603e 0%, transparent 70%),
    radial-gradient(ellipse at 100% 0%, #36603e 0%, transparent 70%),
    var(--primary);
  color: var(--on-primary);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-lg);
  transition: filter 0.25s ease;

  &:hover {
    filter: brightness(1.35);
  }
}

.header__burger {
  display: inline-flex;
  color: var(--primary);
  padding: var(--space-xs);

  @include md {
    display: none;
  }
}
</style>
