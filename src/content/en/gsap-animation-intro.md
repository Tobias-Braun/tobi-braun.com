---
title: "Decorative Frontend Animations with GSAP – An Introduction"
description: "A practical introduction to decorative scroll animations with GSAP. From simple reveal animations to stagger effects – including lifecycle handling and matchMedia for user preferences."
category: Technical
date: 2025-05-15
readTime: "12 min"
image: "/articles/gsap-animation-intro/gsap-thumb.png"
lang: en
translationSlug: gsap-animation-intro
---

## 1 Introduction

The web is constantly evolving. New CSS features and component libraries make it increasingly easy to create good-looking, well-structured layouts. Modern technologies like CSS Grid and Flexbox, along with many other features, simplify the implementation of complex layouts. Component libraries and new HTML elements help efficiently implement and style common UI patterns.

To stand out despite all these innovations and delight the visitors of your site, it's worth taking a closer look at animations.

In the following, I'd like to show you – using a simple example – how you can quickly and easily add animations with the GSAP animation library that make your websites subtly more interesting.

## 2 Animations

We're all familiar with animations in web apps. There are many different kinds – from simple opacity changes on backdrops to complex fade-ins on dropdown menus.
I distinguish between two types of animations:

**Functional animations** are established in many web apps and component libraries and help users interact with dynamic elements. They are often nearly necessary – or at the very least very useful – to make interactive elements more understandable. Examples include the show/hide animation of dropdown elements or an animation when opening an accordion. Typically, these animations are integrated directly into the components and are part of the component's functionality.

**Decorative animations**, on the other hand, primarily serve the user experience. They increase immersion, engage users visually, and reinforce the brand identity of an application. Importantly, they are not strictly necessary to make features in the app understandable. One of the simplest decorative animations is softly fading in elements as they enter the user's visible area (viewport).

The difference can be summarised simply: **Functional explains, decorative emotionalises.**

Today we're interested in this second type: **decorative animations**.

Decorative animations allow us to make our apps more appealing and help them stand out from the crowd. A big advantage: we can add them retroactively, and they are not required – the app doesn't depend on them. Most of the time, no special structures are required for decorative animations either. Existing elements and styles can remain as they are. This lets us apply Progressive Enhancement and improve existing applications to any extent. In stressful projects we can initially skip decorative animations without worrying that this will significantly increase development time later.

**Note:** While decorative animations enhance applications, they can also be problematic depending on the target audience and device. They can increase load times and affect page performance. Users who are sensitive to a lot of motion, or who simply find it distracting, may perceive decorative animations negatively. It is therefore important to respect user preferences via media queries (`prefers-reduced-motion`) and to use animations subtly and purposefully. Often, less is more.

The context of the app also matters. In an internal data management tool used purely for its functionality with no need to "hook" users, decorative animations are less important than in an e-commerce app designed to encourage a purchase. You should therefore think carefully before using them: how relevant are decorative animations for your use case, and does the benefit outweigh the cost?

## 3 Implementation with GSAP

So how do we best add decorative animations to our apps?

There are many ways to implement decorative animations. You could of course implement everything natively and, in the ideal case, end up with the most performant animations while avoiding JavaScript in many places. However, this is error-prone and usually comes with significantly higher development time. Remember: decorative animations are not a core requirement – we want to delight our users with them. That also means we can't spend too much time adding them.

Fortunately, **GSAP (GreenSock Animation Platform)** – which has been freely usable for many commercial purposes since 30 April 2025 – is an animation library that makes creating numerous decorative animations extremely easy.

### Example: Reveal animation for info cards

Let's imagine a simple row of cards meant to build our anticipation for the coming seasons:

- Card 1: "Spring"
- Card 2: "Summer"
- Card 3: "Autumn"
- Card 4: "Winter"

In the layout, these cards are arranged side by side in a row.

#### HTML base structure

A simple structure like this is sufficient as a starting point:

```html
<section class="feature-section">
  <div class="feature-card green">
    <h3>Spring</h3>
    <ul>
      <li>Fresh awakening</li>
      <li>New life energy</li>
    </ul>
  </div>
  <div class="feature-card orange">
    <h3>Summer</h3>
    <ul>
      <li>Endless sunny days</li>
      <li>Outdoor adventures</li>
    </ul>
  </div>
  <div class="feature-card purple">
    <h3>Autumn</h3>
    <ul>
      <li>Golden sea of leaves</li>
      <li>Time for reflection</li>
    </ul>
  </div>
  <div class="feature-card cyan">
    <h3>Winter</h3>
    <ul>
      <li>Maximum cosiness</li>
      <li>Stillness & regeneration</li>
    </ul>
  </div>
</section>
```

We style the cards with a bit of CSS, and when we scroll to them on a page it looks like this:

![No Animation](/articles/gsap-animation-intro/no-anim.mov)

Without animation, the cards simply appear "hard" in the viewport as soon as the page is loaded. It works, but now let's look at how we can make it more interesting.

#### Reveal animation

With a **scroll-based reveal animation** we want the cards to gently slide upward while simultaneously fading in from a lower opacity as they are scrolled into the visible area.

First we need to register the GSAP ScrollTrigger plugin. This happens directly before using GSAP.

```javascript
// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);
```

Then we add a reveal animation:

```javascript
// Reveal animation for all cards
gsap.from(".feature-card", {
  scrollTrigger: {
    trigger: ".feature-section",
    start: "top 80%",
  },
  y: 40,
  opacity: 0,
  scale: 0.95,
  duration: 1,
});
```

With `gsap.from()` we define an animation by specifying the animation's start state. The end state is automatically set to the element's default state.

The parameters in `scrollTrigger` define when the animation is executed. Using the CSS selector `.feature-section`, GSAP watches when the element is in the viewport. It starts when the element's top edge is at 80% of the viewport height.
The other parameters define the animation itself. With `y`, the card starts the animation shifted 40 pixels downward. The `opacity` starts at 0, causing the card to fade in smoothly. With `scale` we achieve a slight grow effect as the cards animate. `duration` defines the animation length in seconds, and `ease` lets you select an easing function.

When we now scroll to the cards, it looks like this:

![Reveal Animation](/articles/gsap-animation-intro/reveal.mov)

As soon as the cards reach 80% of the viewport, they fade in smoothly. Already looking quite good.

#### Stagger effect: cards appearing offset in time

In the next step we want to make the animation a bit more lively: instead of all cards appearing at the same time, they should appear with a slight time offset.

GSAP provides the `stagger` option for this. We simply add it to our animation object:

```javascript
gsap.from(".feature-card", {
  scrollTrigger: {
    trigger: ".feature-section",
    start: "top 80%",
  },
  y: 40,
  opacity: 0,
  scale: 0.95,
  duration: 1,
  ease: 'power2.out',
  stagger: 0.12,
});
```

When users now scroll to the cards, they see the following animation:

![Reveal Animation](/articles/gsap-animation-intro/stagger.mov)

The content is now displayed in an engaging way and users are introduced to the content in the natural reading direction. And the best part: we achieved all of this with 10 lines of code and were able to quickly and easily enhance our website.

### Using GSAP in frameworks and component-based development

The logic shown above also works in established frontend frameworks. The key points to keep in mind:

GSAP animations must not be started until the DOM is mounted.
If the DOM structure changes (e.g. through conditional rendering or dynamic lists), the animations may need to be re-initialised or updated. The lifecycle methods provided by the respective frameworks can simply be used for this.

It is also important to clean up event listeners for animations when a component is no longer needed. GSAP provides the `context()` function for this purpose. GSAP animations created within a context can be cleaned up via the `context.revert()` function.

Here too, when using frameworks, it makes sense to call `context.revert()` in the typical `unmount` lifecycle hook.

Here is an example:

```javascript
const ctx = gsap.context(() => {
  gsap.from(".feature-card", {
    scrollTrigger: {
      trigger: ".feature-section",
      start: "top 80%",
    },
    y: 40,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
  });
});

// Cleanup: removes all listeners for the animations (apply in lifecycle methods)
ctx.revert();
```

### MatchMedia: respecting user preferences and making animations responsive

When we use decorative animations, we should always consider the environment and preferences of our users. GSAP provides `matchMedia()` as an elegant way to couple animations to media queries – very similar to how we know it from CSS.

Instead of defining animations globally, we can wrap them in `matchMedia.add()` and tie them to specific conditions, such as screen widths or the system-set preference `prefers-reduced-motion`.

Here is a simple example that only activates the reveal animation shown above when users have not requested reduced motion:

```javascript
const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".feature-card", {
    scrollTrigger: {
      trigger: ".feature-section",
      start: "top 80%",
    },
    y: 40,
    opacity: 0,
    scale: 0.95,
    duration: 1,
    ease: "power2.out",
    stagger: 0.12,
  });
});
```

In this example the animation is only created when the system indicates that no reduced motion is preferred. If `prefers-reduced-motion` is active, the animations are never initialised – the page remains static and therefore more comfortable for sensitive users.

The big advantage: we don't need to maintain separate code paths; instead we can tie animations precisely to viewport width, device type, or user preferences. `matchMedia()` also handles context and cleanup whenever the media query changes (e.g. on resize).
`matchMedia` replaces `gsap.context`. If we now want to clean up our animations, we can do so via matchMedia:

```javascript
// Cleanup: removes all listeners for the animations
mm.revert();
```

This is how we combine decorative animations with responsible handling of user preferences and create a better, more inclusive user experience.

## More complex animations – what else is possible with GSAP

The cards example is only a very small glimpse of what is possible with GSAP. The library offers a wide variety of additional functions and plugins that allow significantly more complex animations to be implemented.

In addition to `gsap.from()`, there is also `gsap.to()`, `gsap.fromTo()`, and timelines (`gsap.timeline()`), with which multiple animation steps can be precisely coordinated in sequence and relative to one another. ScrollTrigger can be used not only to fade in individual elements on scroll – the scroll position itself can serve as a "timeline scrubber". This lets us tie animations directly to scroll progress, for example for parallax effects or complex storytelling pages.

With plugins like SplitText, texts can be split into words, lines, or individual characters to animate them individually – for example for typing effects, exciting headlines, or hero animations. Combined with ScrollTrigger, entire text passages can dynamically come into view without us having to write complex custom logic.

Horizontal scrolling can also be achieved with GSAP, even though the browser scrolls vertically by default. For example, we can "pin" sections and convert vertical scrolling into horizontal movement of content. This works well for storytelling elements, timelines, or product galleries.

The examples shown here therefore only scratch the surface. If you want to go deeper, it's worth looking at the documentation and the numerous CodePens and demos on the GSAP website at gsap.com. Feel free to leave a comment if you'd like to know more about a specific use case.

## 4 Conclusion

Decorative animations are not a must, but they can make a decisive difference when it comes to perception, brand identity, and user experience. Used correctly, they support the content structure, direct the eye, and ensure that an application feels more polished and "alive" – without overshadowing the actual functionality.

With GSAP we have a tool at our disposal that takes care of many typical pitfalls with JavaScript animations: clean timing, performant transitions, scroll integration, lifecycle handling, and respect for user preferences. Precisely because decorative animations are often "nice-to-have", it's important to be able to implement them efficiently – with as little code as possible and without restructuring the existing layout. This is exactly where GSAP excels.

Essential to keep in mind are a few core principles:

Decorative animations should always be used subtly and purposefully – less is often more.
User preferences like `prefers-reduced-motion` must be respected.
Animations should be understood as an enhancement, not a prerequisite for usability.
If you want to start experimentally in existing projects, a small, clearly bounded scenario is a good starting point – such as the reveal animation for individual content blocks shown here. From there you can gradually try out more complex effects and see how they affect user experience and performance.
