import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  // 公開 URL の接頭辞は Worker に届く前に剥がされ、ビルド時には分からない。
  // アセットは相対パスで参照する。
  base: './',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // ZIP の中では assets/ の下に置かれるので、assets/assets/ にならないようにする。
    assetsDir: 'static',
  },
})
