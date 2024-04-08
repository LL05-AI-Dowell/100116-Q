import { Route, Routes } from "react-router-dom";
import useDowellLogin from "./hooks/useDowellLogin";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";
import Success from "./pages/SuccessPage/SuccessPage";
import ErrorScreen from "./pages/ErrorScreen/ErrorScreen";
import { PageUnderConstruction } from "./pages/PageUnderConstruction/PageUnderConstruction";
import LandingPage2 from "./pages/LandingPage/LandingPage2";
import QrCodeScreen from "./pages/QrCodeScreen/QrCodeScreen";
import OnlineQrCodeScreen from "./pages/OnlineQrCodeScreen/OnlineQrCodeScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  console.log = () => { };
  useDowellLogin();

  // // USE ONLY WHEN APP IS BROKEN/UNDERGOING MAJOR CHANGES
  // return <Routes>
  //   <Route path="*" element={<PageUnderConstruction />} />
  // </Routes>

  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path='/' Component={LandingPage2} />
        <Route path='/view' Component={LandingPage} />
        <Route path='/profile' Component={Profile} />
        <Route path='/success' Component={Success} />
        <Route path='/error' Component={ErrorScreen} />
        <Route path='/qrlink' Component={QrCodeScreen} />
        <Route path='/onlineshoplink' Component={OnlineQrCodeScreen} />
      </Routes>
    </>
  );
}

export default App;
