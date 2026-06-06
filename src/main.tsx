import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useMemberStore } from './store/useMemberStore'
import { useCoachStore } from './store/useCoachStore'
import { useBookingStore } from './store/useBookingStore'
import { usePackageStore } from './store/usePackageStore'
import { useMetricStore } from './store/useMetricStore'

async function initStores() {
  await useMemberStore.getState().loadMembers()
  await useCoachStore.getState().loadCoaches()
  await useBookingStore.getState().loadBookings()
  await usePackageStore.getState().loadPackages()
  await useMetricStore.getState().loadMetrics()
}

initStores().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
