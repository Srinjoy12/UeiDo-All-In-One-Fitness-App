import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SetupRequired } from './components/SetupRequired'
import { useReminderNotifications } from './hooks/useReminderNotifications'
import { hasSupabaseConfig } from './lib/supabaseClient'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Diet from './pages/Diet'
import BMI from './pages/BMI'
import MealPhoto from './pages/MealPhoto'
import Motivation from './pages/Motivation'
import Reminders from './pages/Reminders'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'

function App() {
  useReminderNotifications()

  if (!hasSupabaseConfig) {
    return <SetupRequired />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="diet" element={<Diet />} />
          <Route path="bmi" element={<BMI />} />
          <Route path="meal-photo" element={<MealPhoto />} />
          <Route path="motivation" element={<Motivation />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
