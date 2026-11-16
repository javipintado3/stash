import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// The SVG already has a solid full-bleed background, so no extra padding is added
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, resizeOptions: { background: '#00AEEF' } },
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#00AEEF' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#00AEEF' } },
  },
  images: ['public/icon.svg'],
})
