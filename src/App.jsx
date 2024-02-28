import { Route, Routes } from "react-router-dom";
import useDowellLogin from "./hooks/useDowellLogin";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";
import StepModal from "./pages/Modal/Modal";

function App() {
  useDowellLogin();

  return (
    <Routes>
      <Route path="/" Component={LandingPage} />
      <Route path="/profile" Component={Profile} />
    </Routes>
  )
}

export default App
