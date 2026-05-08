<script setup lang="ts">
defineProps<{
  title: string
  period: string
  description: string
  icon: string
  tags: string[]
  active?: boolean
}>()
</script>

<template>
  <li class="item" :class="{ 'item--active': active }">
    <span class="item__bullet" aria-hidden="true">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </span>
    <div class="item__body">
      <header class="item__head">
        <h3 class="item__title">{{ title }}</h3>
        <span class="item__period">{{ period }}</span>
      </header>
      <p class="item__desc">{{ description }}</p>
      <ul class="item__tags">
        <li v-for="t in tags" :key="t" class="item__tag">{{ t }}</li>
      </ul>
    </div>
  </li>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.item {
  position: relative;
  padding-left: 64px;
  padding-block: var(--space-sm);

  @include md {
    padding-left: 96px;
  }
}

.item__bullet {
  position: absolute;
  left: 24px;
  top: var(--space-sm);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: var(--surface-variant);
  color: var(--on-surface-variant);
  border: 4px solid var(--surface);
  border-radius: var(--radius-full);
  transform: translateX(-50%);
  z-index: 1;
  box-shadow: 0 2px 6px rgba(101, 47, 19, 0.08);

  @include md {
    left: 40px;
  }

  .item--active & {
    background: var(--primary-container);
    color: var(--on-primary-container);
  }
}

.item__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.item__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);

  @include md {
    flex-direction: row;
    align-items: baseline;
    gap: var(--space-md);
  }
}

.item__title {
  @extend %headline-md;
  color: var(--on-surface);
}

.item__period {
  @extend %label-md;
  color: var(--tertiary);
}

.item__desc {
  @extend %body-md;
  color: var(--on-surface-variant);
  max-width: 60ch;
}

.item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.item__tag {
  @extend %label-md;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--surface-container);
  color: var(--on-surface);

  .item--active & {
    background: var(--primary-fixed);
    color: var(--on-primary-fixed);
  }
}
</style>
