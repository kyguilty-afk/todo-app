import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pagesのリポジトリ名に合わせて設定（例: /todo-app/）
  // リポジトリ名を変えた場合はここを合わせて変更してください
  base: '/todo-app/',
})
