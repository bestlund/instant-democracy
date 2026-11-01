import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { DeviceFrame } from './components/DeviceFrame'
import { StoreProvider, useStore } from './data/store'
import Home from './screens/Home'
import Group from './screens/Group'
import ThreadScreen from './screens/Thread'
import Notifications from './screens/Notifications'

// HashRouter: links like /#/g/roommates work on Vercel and any static host
// without rewrite rules, and refreshing never gives a 404.

function Reset() {
  const { dispatch } = useStore()
  const navigate = useNavigate()
  useEffect(() => {
    dispatch({ type: 'reset' })
    navigate('/', { replace: true })
  }, [dispatch, navigate])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <DeviceFrame>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/g/:groupId" element={<Group />} />
            <Route path="/g/:groupId/t/:threadId" element={<ThreadScreen />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DeviceFrame>
      </HashRouter>
    </StoreProvider>
  )
}
