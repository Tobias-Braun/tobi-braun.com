<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Particle = {
  symbol: "slash" | "parens" | "tag" | "curly";
  x: number; // % of container
  y: number; // % of container
  size: number; // px
  rotate: number; // deg, applied to inner svg as static base orientation
  color: "green" | "brown";
  depth: 1 | 2 | 3; // 1 = front (more visible, flies further), 3 = back
};

// Single cluster around portrait + headline. X range 16–84% pulls
// particles inward (away from the far edges); density peaks around the
// portrait (y 14–32%) and headline/lead area (y 36–58%). Far corners
// stay empty so the field reads as one coherent group, not a frame.
const particles: Particle[] = [
  // Top ring — sparse, above the portrait
  {
    symbol: "slash",
    x: 32,
    y: 6,
    size: 24,
    rotate: 25,
    color: "green",
    depth: 3,
  },
  {
    symbol: "curly",
    x: 44,
    y: 4,
    size: 22,
    rotate: -8,
    color: "green",
    depth: 3,
  },
  {
    symbol: "parens",
    x: 58,
    y: 8,
    size: 24,
    rotate: 14,
    color: "green",
    depth: 3,
  },
  {
    symbol: "tag",
    x: 68,
    y: 6,
    size: 24,
    rotate: -10,
    color: "brown",
    depth: 3,
  },

  // Around portrait — denser
  {
    symbol: "slash",
    x: 22,
    y: 24,
    size: 38,
    rotate: -20,
    color: "green",
    depth: 1,
  },
  {
    symbol: "parens",
    x: 28,
    y: 16,
    size: 26,
    rotate: 18,
    color: "green",
    depth: 2,
  },
  {
    symbol: "curly",
    x: 32,
    y: 30,
    size: 26,
    rotate: 12,
    color: "brown",
    depth: 2,
  },
  {
    symbol: "slash",
    x: 16,
    y: 30,
    size: 28,
    rotate: -10,
    color: "green",
    depth: 2,
  },
  {
    symbol: "parens",
    x: 72,
    y: 18,
    size: 30,
    rotate: -16,
    color: "green",
    depth: 2,
  },
  {
    symbol: "tag",
    x: 78,
    y: 26,
    size: 36,
    rotate: 14,
    color: "green",
    depth: 1,
  },
  {
    symbol: "tag",
    x: 74,
    y: 32,
    size: 28,
    rotate: -8,
    color: "brown",
    depth: 3,
  },
  {
    symbol: "slash",
    x: 84,
    y: 22,
    size: 28,
    rotate: 22,
    color: "green",
    depth: 3,
  },

  // Around headline + lead — denser
  {
    symbol: "slash",
    x: 24,
    y: 38,
    size: 30,
    rotate: -8,
    color: "green",
    depth: 2,
  },
  {
    symbol: "tag",
    x: 20,
    y: 50,
    size: 32,
    rotate: 12,
    color: "brown",
    depth: 2,
  },
  {
    symbol: "parens",
    x: 30,
    y: 56,
    size: 30,
    rotate: -14,
    color: "green",
    depth: 3,
  },
  {
    symbol: "curly",
    x: 32,
    y: 44,
    size: 28,
    rotate: 18,
    color: "brown",
    depth: 3,
  },
  {
    symbol: "parens",
    x: 68,
    y: 42,
    size: 30,
    rotate: -16,
    color: "green",
    depth: 2,
  },
  {
    symbol: "slash",
    x: 76,
    y: 50,
    size: 32,
    rotate: 16,
    color: "green",
    depth: 1,
  },
  {
    symbol: "curly",
    x: 80,
    y: 38,
    size: 26,
    rotate: -12,
    color: "brown",
    depth: 3,
  },
  {
    symbol: "slash",
    x: 72,
    y: 56,
    size: 28,
    rotate: 8,
    color: "green",
    depth: 3,
  },

  // Lower ring — sparse, around CTA / bottom of hero
  {
    symbol: "parens",
    x: 28,
    y: 64,
    size: 28,
    rotate: -10,
    color: "green",
    depth: 3,
  },
  {
    symbol: "curly",
    x: 38,
    y: 70,
    size: 24,
    rotate: 8,
    color: "brown",
    depth: 3,
  },
  {
    symbol: "tag",
    x: 62,
    y: 68,
    size: 26,
    rotate: -14,
    color: "brown",
    depth: 3,
  },
  {
    symbol: "parens",
    x: 72,
    y: 64,
    size: 26,
    rotate: 18,
    color: "green",
    depth: 3,
  },
];

const viewBoxFor = (s: Particle["symbol"]): string => {
  if (s === "tag") return "0 0 40 24";
  if (s === "slash") return "0 0 28 32";
  return "0 0 28 28"; // curly, parens
};

const root = ref<HTMLElement>();
let ctx: gsap.Context | null = null;

onMounted(() => {
  // Skip all motion when the user prefers reduced motion. Particles remain
  // visible at their initial positions as a static decorative pattern.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  ctx = gsap.context(() => {
    // Fade in on the inner SVG so this tween and the scroll-driven opacity tween
    // on the host never touch the same property on the same element.
    gsap.from(".particle", {
      opacity: 0,
      duration: 0.25,
      stagger: 0.04,
      delay: 0.3,
      ease: "power2.out",
    });

    // Two transform layers per particle: the outer host receives
    // scroll-driven motion (y, x, rotation, opacity), the inner svg receives
    // idle motion (y oscillation, rotation yoyo). Splitting them prevents the
    // scroll-scrub and idle-yoyo tweens from fighting over the same property
    // on the same element — which used to cause a jump when scrolling started.
    gsap.utils.toArray<HTMLElement>(".particle-host").forEach((host, i) => {
      const inner = host.querySelector<HTMLElement>(".particle");
      if (!inner) return;
      const depth = Number(host.dataset.depth ?? 2);

      // Idle (inner svg)
      gsap.to(inner, {
        y: `+=${gsap.utils.random(4, 16)}`,
        duration: gsap.utils.random(2, 5),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.15,
      });
      gsap.to(inner, {
        rotation: `+=${gsap.utils.random(3, 12)}`,
        duration: gsap.utils.random(5, 9),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.1,
      });

      // Scroll (host) — parallax: front particles (depth 1) fly furthest.
      const fly = -200 - (4 - depth) * 80;
      gsap.to(host, {
        y: fly,
        x: gsap.utils.random(-40, 40),
        rotation: gsap.utils.random(15, 45),
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>

<template>
  <div class="particles" aria-hidden="true" ref="root">
    <!-- Symbol library — defined once, referenced via <use> below. -->
    <svg class="particles__defs" width="0" height="0" aria-hidden="true">
      <defs>
        <!-- // line comment -->
        <symbol id="hp-slash" viewBox="0 0 28 32" fill="none">
          <path
            d="M5 28 L13 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M15 28 L23 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </symbol>

        <!-- () parentheses -->
        <symbol id="hp-parens" viewBox="0 0 28 28" fill="none">
          <path
            d="M11 3 Q4 14 11 25"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <path
            d="M17 3 Q24 14 17 25"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
        </symbol>

        <!-- </> tag -->
        <symbol id="hp-tag" viewBox="0 0 40 24" fill="none">
          <path
            d="M14 6 L6 12 L14 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M26 6 L34 12 L26 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22 4 L18 20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </symbol>

        <!-- {} curly braces -->
        <symbol id="hp-curly" viewBox="0 0 28 28" fill="none">
          <path
            d="M10 4 Q6 4 6 8 L6 12 Q6 14 4 14 Q6 14 6 16 L6 20 Q6 24 10 24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18 4 Q22 4 22 8 L22 12 Q22 14 24 14 Q22 14 22 16 L22 20 Q22 24 18 24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </symbol>
      </defs>
    </svg>

    <!--
      Two-layer structure (host + inner svg) so scroll-scrub and idle-yoyo
      can each control their own transform without fighting over `y`/`rotation`
      on a single element. See script for details.
    -->
    <div
      v-for="(p, i) in particles"
      :key="i"
      class="particle-host"
      :class="`particle--depth-${p.depth}`"
      :data-depth="p.depth"
      :style="{
        left: p.x + '%',
        top: p.y + '%',
        width: p.size + 'px',
      }"
    >
      <svg
        class="particle"
        :class="`particle--${p.color}`"
        :viewBox="viewBoxFor(p.symbol)"
        :style="{ transform: `rotate(${p.rotate}deg)` }"
      >
        <use :href="`#hp-${p.symbol}`" />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  // Particles disappear cleanly once they leave the hero box during scroll.
  overflow: hidden;
}

.particles__defs {
  position: absolute;
}

.particle-host {
  position: absolute;
  // Promote to a compositor layer for smoother scroll animation.
  will-change: transform, opacity;
}

.particle {
  display: block;
  width: 100%;
  height: auto;
  will-change: transform;
}

// Fills/strokes inherit from `color` thanks to `currentColor` in symbols.
.particle--green {
  color: #adcfb0;
}
.particle--brown {
  color: #62432a;
}

// Depth → base opacity. Shallower (depth 1) = more visible.
// Applied to the host since opacity is animated by the scroll tween there.
.particle--depth-1 {
  opacity: 0.42;
}
.particle--depth-2 {
  opacity: 0.28;
}
.particle--depth-3 {
  opacity: 0.18;
}
</style>
