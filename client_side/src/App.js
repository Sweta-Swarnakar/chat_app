
import './App.css';
import { useEffect } from 'react';
import ChatArea from './Components/ChatArea';
import Login from './Components/Login';
import MainContainer from './Components/MainContainer';
import Profile from './Components/Profile';
import Welcome from './Components/Welcome';
import Users from './Components/Users';
import Groups from './Components/Groups';
import CreateGroups from './Components/CreateGroups';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RedirectIfAuth, RequireAuth } from './Components/RouteGuards';
import { useSession } from './context/SessionContext';
import { useAppSelector } from './hooks/reduxHooks';

function App() {
  const lightTheme = useAppSelector((state) => state.themeKey);
  const { ready } = useSession();

  useEffect(() => {
    document.body.classList.toggle("theme-dark", !lightTheme);
    document.body.classList.toggle("theme-light", lightTheme);
    return () => {
      document.body.classList.remove("theme-dark");
      document.body.classList.remove("theme-light");
    };
  }, [lightTheme]);

  return (
    <div className={`App ${lightTheme ? "theme-light" : "theme-dark"}`}>
      {!ready ? null : (
      <Routes>
        <Route
          path="/"
          element={<RedirectIfAuth><Login /></RedirectIfAuth>}
        />
        <Route element={<RequireAuth />}>
          <Route path="app" element={<MainContainer />}>
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<Welcome />} />
            <Route path="chat/:chatId" element={<ChatArea />} />
            <Route path="users" element={<Users />} />
            <Route path="groups" element={<Groups />} />
            <Route path="create-groups" element={<CreateGroups />} />
            <Route path="groups/:groupId/manage" element={<CreateGroups />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
      )}
    </div>
  );
}

export default App;
