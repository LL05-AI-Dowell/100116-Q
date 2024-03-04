import { Route, Routes } from "react-router-dom";
import useDowellLogin from "./hooks/useDowellLogin";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";
import Success from "./pages/SuccessPage/SuccessPage";
import ErrorScreen from "./pages/ErrorScreen/ErrorScreen";

function App() {
  useDowellLogin();

  return (
    <Routes>
      <Route path="/" Component={LandingPage} />
      <Route path="/profile" Component={Profile} />
      <Route path="/success" Component={Success} />
      <Route path="/error" Component={ErrorScreen} />
    </Routes>
  )

}

export default App
