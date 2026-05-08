<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocale } from '../../composables/useLocale'
import ArticleCard from './ArticleCard.vue'

type Category = 'Technical' | 'Lifestyle' | 'Work-Life-Balance'

type Post = {
  id: string
  data: {
    title: string
    description: string
    category: Category
    date: string
    readTime: string
    image?: string
    featured?: boolean
    lang: 'de' | 'en'
    translationSlug?: string
  }
}

const slugOf = (id: string) => id.split('/').pop()!.replace(/\.md$/, '')
const articleHref = (id: string) => `/${locale.value}/blog/${slugOf(id)}`

const props = defineProps<{ allPosts: Post[] }>()

const PAGE_SIZE = 6
const { locale, ui } = useLocale()

const filters = computed(() => [
  { label: ui.value.blog.filterAll, value: 'all' as const },
  { label: 'Technical', value: 'Technical' as Category },
  { label: 'Lifestyle', value: 'Lifestyle' as Category },
  { label: 'Work-Life-Balance', value: 'Work-Life-Balance' as Category },
])

const active = ref<Category | 'all'>('all')
const visibleCount = ref(PAGE_SIZE)

/** Client-side filter by language so a locale change re-filters without refetch. */
const posts = computed(() => props.allPosts.filter(p => p.data.lang === locale.value))
const featured = computed(() => posts.value.find(p => p.data.featured) ?? posts.value[0])
const others = computed(() => {
  const all = posts.value.filter(p => p.id !== featured.value?.id)
  return active.value === 'all' ? all : all.filter(p => p.data.category === active.value)
})
const visible = computed(() => others.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < others.value.length)

/** Reset pagination whenever the active filter or locale changes. */
watch([active, locale], () => { visibleCount.value = PAGE_SIZE })

function loadMore() { visibleCount.value += PAGE_SIZE }

const root = ref<HTMLElement>()
let ctx: gsap.Context
let cardCtx: gsap.Context | undefined

function registerCardAnims() {
  cardCtx = gsap.context(() => {
    gsap.fromTo(
      '.blog__grid .card',
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.16,
        clearProps: 'transform',
        ease: 'power2.out',
        once: true,
      },
    )
    gsap.fromTo(
      '.card--feature',
      { opacity: 0 },
      { opacity: 1, duration: 0.15, ease: 'power3.out' },
    )
  }, root.value)
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    gsap.from(['.blog__title', '.blog__lead'], {
      y: 32,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
    })
    gsap.from('.blog__filter', {
      y: 12,
      opacity: 0,
      duration: 0.5,
      stagger: 0.07,
      delay: 0.2,
      ease: 'power2.out',
    })
  })
  registerCardAnims()
})

watch(active, async () => {
  cardCtx?.revert()
  await Promise.resolve() // nextTick equivalent
})

onUnmounted(() => {
  ctx?.revert()
  cardCtx?.revert()
})
</script>

<template>
  <div class="blog" ref="root">
    <!-- Header -->
    <header class="blog__head">
      <h1 class="blog__title gradient-text--black-brown">
        {{ ui.blog.heading }}
      </h1>
      <p class="blog__lead">{{ ui.blog.lead }}</p>
    </header>

    <!-- Filters -->
    <div class="blog__filters" role="tablist" aria-label="Kategorien">
      <button
        v-for="f in filters"
        :key="f.value"
        class="blog__filter"
        :class="{ 'is-active': active === f.value }"
        :aria-pressed="active === f.value"
        @click="active = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Featured (only shown when "all" filter is active) -->
    <ArticleCard
      v-if="featured && active === 'all'"
      :to="articleHref(featured.id)"
      :title="featured.data.title"
      :description="featured.data.description"
      :category="featured.data.category"
      :date="featured.data.date"
      :read-time="featured.data.readTime"
      :image="featured.data.image"
      variant="feature"
    />

    <!-- Grid -->
    <div class="blog__grid">
      <ArticleCard
        v-for="post in visible"
        :key="post.id"
        :to="articleHref(post.id)"
        :title="post.data.title"
        :description="post.data.description"
        :category="post.data.category"
        :date="post.data.date"
        :read-time="post.data.readTime"
      />
    </div>

    <div class="blog__more">
      <button class="blog__more-btn" :disabled="!hasMore" @click="loadMore">
        {{ ui.blog.loadMore }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.blog {
  @include container;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding-block: var(--space-xl);
}

.blog__head {
  text-align: center;
  max-width: 48rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.blog__title {
  @extend %headline-xl;
  color: var(--on-surface);
}

.blog__lead {
  @extend %body-lg;
  color: var(--on-surface-variant);
}

// Filters
.blog__filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
}

.blog__filter {
  @extend %label-md;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  background: var(--surface-variant);
  color: var(--on-surface-variant);
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: var(--surface-dim);
  }

  &.is-active {
    background: var(--secondary);
    color: var(--on-secondary);
    box-shadow: 0 2px 6px rgba(120, 88, 63, 0.15);
  }
}

// Grid
.blog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

// Load more
.blog__more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-lg);
}

.blog__more-btn {
  @extend %label-md;
  padding: 12px 32px;
  border: 2px solid var(--primary);
  color: var(--primary);
  border-radius: var(--radius-lg);
  text-transform: uppercase;
  transition: background-color 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    background: rgba(39, 68, 45, 0.05);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    border-color: var(--outline-variant);
    color: var(--outline);
  }
}
</style>
