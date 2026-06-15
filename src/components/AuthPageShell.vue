<script setup lang="ts">
import { MapPin, ShieldCheck, UsersRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description: string
    wide?: boolean
  }>(),
  {
    eyebrow: 'Your local community',
    wide: false,
  },
)
</script>

<template>
  <div class="auth-shell">
    <div class="auth-shell__glow auth-shell__glow--one" aria-hidden="true"></div>
    <div class="auth-shell__glow auth-shell__glow--two" aria-hidden="true"></div>
    <div class="auth-shell__grid" aria-hidden="true"></div>

    <header class="auth-shell__header">
      <RouterLink to="/" class="auth-shell__brand" aria-label="Nearme Social home">
        <BrandLogo />
      </RouterLink>
      <slot name="header-action"></slot>
    </header>

    <main class="auth-shell__main" :class="{ 'auth-shell__main--wide': wide }">
      <aside class="auth-shell__story">
        <div class="auth-shell__story-copy">
          <p class="auth-shell__eyebrow">
            <MapPin :size="16" stroke-width="2.2" />
            {{ eyebrow }}
          </p>
          <h1>{{ title }}</h1>
          <p class="auth-shell__description">{{ description }}</p>
        </div>

        <div class="auth-shell__benefits">
          <div class="auth-shell__benefit">
            <span><UsersRound :size="19" /></span>
            <div>
              <strong>Real nearby connections</strong>
              <small>Discover people and conversations around you.</small>
            </div>
          </div>
          <div class="auth-shell__benefit">
            <span><ShieldCheck :size="19" /></span>
            <div>
              <strong>Designed with privacy in mind</strong>
              <small>Your precise location stays protected.</small>
            </div>
          </div>
        </div>

        <div class="auth-shell__community">
          <div class="auth-shell__avatars" aria-hidden="true">
            <span>J</span>
            <span>S</span>
            <span>M</span>
          </div>
          <p><strong>Join your local circle</strong><br />Share, discuss, and stay connected.</p>
        </div>
      </aside>

      <div class="auth-shell__content">
        <slot></slot>
      </div>
    </main>

    <footer class="auth-shell__footer">
      <span>Nearme Social</span>
      <span aria-hidden="true">•</span>
      <span>Built for meaningful local connection</span>
    </footer>
  </div>
</template>

<style scoped>
.auth-shell {
  --auth-teal: #0c9081;
  --auth-teal-dark: #087268;
  --auth-navy: #132238;
  --auth-muted: #66758a;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 8% 12%, rgba(12, 144, 129, 0.12), transparent 27rem),
    radial-gradient(circle at 92% 88%, rgba(46, 143, 194, 0.11), transparent 30rem),
    linear-gradient(145deg, #f8fbfc 0%, #eef5f7 52%, #f5f8fb 100%);
  color: var(--auth-navy);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.auth-shell__header,
.auth-shell__main,
.auth-shell__footer {
  position: relative;
  z-index: 2;
}

.auth-shell__header {
  width: min(1240px, calc(100% - 48px));
  min-height: 88px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.auth-shell__brand {
  display: inline-flex;
  text-decoration: none;
}

.auth-shell__brand :deep(.brand-lockup) {
  --brand-symbol-size: 40px;
  --brand-main-size: 1.38rem;
}

.auth-shell__main {
  width: min(1120px, calc(100% - 48px));
  min-height: calc(100vh - 150px);
  margin: 0 auto;
  padding: 30px 0 52px;
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(420px, 0.72fr);
  align-items: center;
  gap: clamp(56px, 8vw, 112px);
}

.auth-shell__main--wide {
  grid-template-columns: minmax(0, 0.72fr) minmax(540px, 0.9fr);
  gap: clamp(44px, 6vw, 84px);
}

.auth-shell__story {
  max-width: 500px;
}

.auth-shell__eyebrow {
  margin: 0 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--auth-teal-dark);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.auth-shell__story h1 {
  max-width: 540px;
  margin: 0;
  color: var(--auth-navy);
  font-size: clamp(2.25rem, 4.8vw, 4.25rem);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.02;
}

.auth-shell__description {
  max-width: 480px;
  margin: 22px 0 0;
  color: var(--auth-muted);
  font-size: clamp(1rem, 1.4vw, 1.12rem);
  line-height: 1.75;
}

.auth-shell__benefits {
  margin-top: 38px;
  display: grid;
  gap: 16px;
}

.auth-shell__benefit {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.auth-shell__benefit > span {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(12, 144, 129, 0.16);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--auth-teal);
  box-shadow: 0 8px 24px rgba(21, 61, 82, 0.06);
}

.auth-shell__benefit div {
  padding-top: 1px;
}

.auth-shell__benefit strong,
.auth-shell__benefit small {
  display: block;
}

.auth-shell__benefit strong {
  color: #203247;
  font-size: 0.92rem;
  line-height: 1.4;
}

.auth-shell__benefit small {
  margin-top: 3px;
  color: #7b8999;
  font-size: 0.82rem;
  line-height: 1.45;
}

.auth-shell__community {
  width: fit-content;
  margin-top: 34px;
  padding: 12px 16px 12px 12px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid rgba(141, 166, 180, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
}

.auth-shell__avatars {
  display: flex;
  padding-left: 7px;
}

.auth-shell__avatars span {
  width: 31px;
  height: 31px;
  margin-left: -7px;
  display: grid;
  place-items: center;
  border: 2px solid #f5fafb;
  border-radius: 50%;
  background: #d8efec;
  color: #0a766a;
  font-size: 0.72rem;
  font-weight: 800;
}

.auth-shell__avatars span:nth-child(2) {
  background: #dceaf4;
  color: #326580;
}

.auth-shell__avatars span:nth-child(3) {
  background: #e7e5f5;
  color: #625b8c;
}

.auth-shell__community p {
  margin: 0;
  color: #778596;
  font-size: 0.75rem;
  line-height: 1.45;
}

.auth-shell__community strong {
  color: #314358;
  font-size: 0.8rem;
}

.auth-shell__content {
  width: 100%;
  min-width: 0;
}

.auth-shell__footer {
  width: min(1240px, calc(100% - 48px));
  min-height: 62px;
  margin: -62px auto 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8995a3;
  font-size: 0.74rem;
}

.auth-shell__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.auth-shell__glow--one {
  width: 340px;
  height: 340px;
  top: -190px;
  right: 12%;
  border: 1px solid rgba(12, 144, 129, 0.11);
}

.auth-shell__glow--two {
  width: 480px;
  height: 480px;
  bottom: -330px;
  left: 8%;
  border: 1px solid rgba(27, 106, 145, 0.1);
}

.auth-shell__grid {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image:
    linear-gradient(rgba(71, 111, 132, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(71, 111, 132, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent);
  pointer-events: none;
}

@media (max-width: 900px) {
  .auth-shell__main,
  .auth-shell__main--wide {
    width: min(620px, calc(100% - 40px));
    min-height: auto;
    padding: 16px 0 100px;
    display: block;
  }

  .auth-shell__story {
    max-width: 560px;
    margin: 22px auto 30px;
    text-align: center;
  }

  .auth-shell__eyebrow {
    margin-bottom: 12px;
  }

  .auth-shell__story h1 {
    margin-inline: auto;
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .auth-shell__description {
    margin: 14px auto 0;
    line-height: 1.6;
  }

  .auth-shell__benefits,
  .auth-shell__community {
    display: none;
  }

  .auth-shell__footer {
    margin-top: -62px;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .auth-shell__header {
    width: calc(100% - 32px);
    min-height: 72px;
  }

  .auth-shell__brand :deep(.brand-lockup) {
    --brand-symbol-size: 34px;
    --brand-main-size: 1.22rem;
  }

  .auth-shell__main,
  .auth-shell__main--wide {
    width: calc(100% - 24px);
    padding-top: 4px;
  }

  .auth-shell__story {
    margin: 14px auto 22px;
    padding-inline: 8px;
  }

  .auth-shell__eyebrow {
    font-size: 0.7rem;
  }

  .auth-shell__story h1 {
    font-size: clamp(1.8rem, 9vw, 2.35rem);
    letter-spacing: -0.045em;
  }

  .auth-shell__description {
    font-size: 0.92rem;
  }

  .auth-shell__footer {
    width: calc(100% - 32px);
    font-size: 0.68rem;
    text-align: center;
  }

  .auth-shell__footer span:nth-child(2),
  .auth-shell__footer span:nth-child(3) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-shell *,
  .auth-shell *::before,
  .auth-shell *::after {
    scroll-behavior: auto !important;
  }
}
</style>
