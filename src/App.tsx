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
import { PerformanceDashboard } from './components/PerformanceDashboard';
import PrivacySecurity from './components/PrivacySecurity';
import LanguageRegional from './components/LanguageRegional';
import HelpSupport from './components/HelpSupport';
import { HealthProvider, useHealth } from './context/HealthContext';
// NOTA (01/08/2026, Claude): a chamada automática a telemetryService.checkAndSync
// foi removida daqui de propósito. Esse serviço envia dados de saúde do
// usuário (condições, medicações, peso/altura/idade) para um webhook externo
// a cada 7 dias sem nenhuma tela de consentimento no app — nunca foi pedido
// e é um risco real de LGPD. Ver processo.txt Parte 6.2. Não reativar sem
// antes construir uma tela de consentimento explícito (opt-in, não opt-out).

function AppRoutes() {
  const { profile } = useHealth();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('health_login') === 'true');

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
        <Route path="performance" element={<PerformanceDashboard />} />
        <Route path="profile/privacy" element={<PrivacySecurity />} />
        <Route path="profile/language" element={<LanguageRegional />} />
        <Route path="profile/help" element={<HelpSupport />} />
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
