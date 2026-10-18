import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppAuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { JoinMeetingPage } from "./pages/JoinMeetingPage";
import { MeetingRoomPage } from "./pages/MeetingRoomPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { RecordingsPage } from "./pages/RecordingsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ScheduleMeetingPage } from "./pages/ScheduleMeetingPage";

export const App: React.FC = () => {
  return (
    <AppAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Direct Meeting Access & Hardware Pre-flight Check */}
          <Route path="/join" element={<JoinMeetingPage />} />
          <Route path="/room/:roomId" element={<MeetingRoomPage />} />

          {/* Authenticated Dashboard Shell */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/recordings" element={<RecordingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/schedule" element={<ScheduleMeetingPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppAuthProvider>
  );
};

export default App;
