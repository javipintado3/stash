import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const BACKGROUND = '#01BAFD'

// The logo is a square image with a solid full-bleed background.
// The maskable icon gets extra padding so Android's circular crop does not cut the text.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0, resizeOptions: { background: BACKGROUND } },
    maskable: { ...minimal2023Preset.maskable, padding: 0.18, resizeOptions: { background: BACKGROUND } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: BACKGROUND } },
  },
  images: ['public/icon.svg'],
})
