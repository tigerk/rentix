import { createApp } from 'vue'
import { getToken } from '@/services/storage'
import { loadAsyncRoutes } from '@/services/permission'
import './app.scss'

let hasLoadedRoutes = false

const App = createApp({
  async onShow() {
    if (!getToken()) return
    if (hasLoadedRoutes) return
    await loadAsyncRoutes(true)
    hasLoadedRoutes = true
  }
})

export default App
