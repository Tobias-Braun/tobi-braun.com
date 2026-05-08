<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to: string
  title: string
  description: string
  category: 'Technical' | 'Lifestyle' | 'Work-Life-Balance'
  date: string
  readTime: string
  image?: string
  variant?: 'default' | 'image' | 'feature'
}>()

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const vtName = computed(() =>
  props.image ? `article-img-${props.to.split('/').pop()}` : undefined
)
</script>

<template>
  <a :href="to" class="card" :class="`card--${variant ?? 'default'}`">
    <div v-if="image && variant !== 'default'" class="card__media">
      <img :src="image" :alt="title" loading="lazy" :style="vtName ? { viewTransitionName: vtName } : {}" />
    </div>

    <div class="card__body">
      <span class="badge" :data-category="category">{{ category }}</span>
      <h3 class="card__title">{{ title }}</h3>
      <p class="card__desc">{{ description }}</p>
      <div class="card__meta">
        <time>{{ formatDate(date) }}</time>
        <span class="card__dot" aria-hidden="true">•</span>
        <span>{{ readTime }} Lesezeit</span>
      </div>
    </div>
  </a>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

// Inlined from CategoryBadge — Vue components cannot import Astro components
.badge {
  @extend %label-md;
  display: inline-block;
  width: fit-content;
  align-self: flex-start;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--surface-variant);
  color: var(--on-surface-variant);

  &[data-category="Technical"] {
    background: var(--primary-fixed);
    color: var(--primary);
  }

  &[data-category="Lifestyle"] {
    background: var(--tertiary-fixed);
    color: var(--tertiary);
  }

  &[data-category="Work-Life-Balance"] {
    background: var(--secondary-fixed);
    color: var(--secondary);
  }
}

.card {
  display: flex;
  flex-direction: column;
  background: radial-gradient(
      ellipse 70% 60% at top right,
      rgba(222, 190, 160, 0.35),
      transparent 60%
    ),
    radial-gradient(
      ellipse 70% 60% at bottom left,
      rgba(222, 190, 160, 0.35),
      transparent 60%
    ),
    var(--surface-container-low);
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid transparent;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
    border-color: var(--surface-variant);
  }
}

.card__media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--surface-dim);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s;
  }

  .card:hover & img {
    transform: scale(1.05);
  }
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  flex: 1;
}

.card__title {
  @extend %headline-md;
  color: var(--on-surface);
  transition: color 0.2s;

  .card:hover & {
    color: var(--primary);
  }
}

.card__desc {
  @extend %body-md;
  color: var(--on-surface-variant);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__meta {
  @extend %label-md;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding-top: var(--space-md);
  border-top: 1px solid var(--surface-variant);
  color: var(--outline);
  font-size: 12px;
}

.card__dot {
  color: var(--outline-variant);
}

// Image card: side-by-side, spans 2 columns on md+
.card--image {
  @include md {
    grid-column: span 2;
    flex-direction: row;

    .card__media {
      width: 40%;
      aspect-ratio: auto;
    }

    .card__body {
      width: 60%;
      justify-content: center;
    }
  }
}

// Feature card: hero-like, larger
.card--feature {
  background: var(--surface-container-low);

  @include md {
    flex-direction: row;

    .card__media {
      width: 50%;
      aspect-ratio: auto;
      min-height: 320px;
    }

    .card__body {
      width: 50%;
      justify-content: center;
      padding: var(--space-xl);
      gap: var(--space-lg);
    }
  }

  .card__title {
    @extend %headline-lg;
  }
}
</style>
