import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Medical from './components/Medical';
import Nutrition from './components/Nutrition';
import Exercises from './components/Exercises';
import AIAssistant from './components/AIAssistant';
import MetricDetail from './components/MetricDetail';
import Insights from './components/Insights';
import Notifications from './components/Notifications';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import Onboarding from './components/Onboarding';
import WaterTracking from './components/WaterTracking';
import Login from './components/Login';
import { HealthProvider, useHealth } from './context/HealthContext';
import { telemetryService } from './services/telemetryService';

function AppRoutes() {
  const { profile, historyRecords, meals, waterLogs, activities } = useHealth();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('health_login') === 'true');

  React.useEffect(() => {
    if (isLoggedIn && profile.onboardingCompleted) {
      telemetryService.checkAndSync(profile, historyRecords, meals, waterLogs, activities);
    }
  }, [isLoggedIn, profile, historyRecords, meals, waterLogs, activities]);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }
  
  if (!profile.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="medical" element={<Medical />} />
        <Route path="nutrition" element={<Nutrition />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="metric/hydration" element={<WaterTracking />} />
        <Route path="metric/:metricType" element={<MetricDetail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HealthProvider>
  );
}
