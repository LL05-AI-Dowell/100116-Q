import { Route, Routes } from "react-router-dom";
import useDowellLogin from "./hooks/useDowellLogin";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";
import Success from "./pages/SuccessPage/SuccessPage";
import ErrorScreen from "./pages/ErrorScreen/ErrorScreen";
import { PageUnderConstruction } from "./pages/PageUnderConstruction/PageUnderConstruction";
import LandingPage2 from "./pages/LandingPage/LandingPage2";
import QrCodeScreen from "./pages/QrCodeScreen/QrCodeScreen";

function App() {
  useDowellLogin();

  // // USE ONLY WHEN APP IS BROKEN/UNDERGOING MAJOR CHANGES
  // return <Routes>
  //   <Route path="*" element={<PageUnderConstruction />} />
  // </Routes>

  return (
    <Routes>
      <Route path="/" Component={LandingPage2} />
      <Route path="/profile" Component={Profile} />
      <Route path="/success" Component={Success} />
      <Route path="/error" Component={ErrorScreen} />
      <Route path="/qrlink" Component={QrCodeScreen} />
    </Routes>
  )

}

export default App
