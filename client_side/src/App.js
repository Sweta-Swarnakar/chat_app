
import './App.css';
import ChatArea from './Components/ChatArea';
import Login from './Components/Login';
import MainContainer from './Components/MainContainer';
import Profile from './Components/Profile';
import Welcome from './Components/Welcome';
import Users from './Components/Users';
import Groups from './Components/Groups';
import CreateGroups from './Components/CreateGroups';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getAuthToken } from './utils/authToken';

function App() {
  const isLoggedIn = !!getAuthToken();

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/app/welcome" replace /> : <Login />}
        />
        <Route
          path="app"
          element={isLoggedIn ? <MainContainer /> : <Navigate to="/" replace />}
        >
          <Route index element={<Navigate to="welcome" replace />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="chat/:chatId" element={<ChatArea />} />
          <Route path="users" element={<Users />} />
          <Route path="groups" element={<Groups />} />
          <Route path="create-groups" element={<CreateGroups />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
