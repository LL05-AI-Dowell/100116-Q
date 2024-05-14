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
import InitialConfigurationScreen from "./pages/InitalConfigurationScreen/InitialConfiguration";

function App() {
  //console.log = () => { };
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
        <Route path='/' Component={InitialConfigurationScreen} />
        <Route 
          path='/offline-store' 
          element={
            <InitialConfigurationScreen>
              <LandingPage2 />
            </InitialConfigurationScreen>
          } 
        />
        <Route 
          path='/online-store'
          element={
            <InitialConfigurationScreen>
              <LandingPage />
            </InitialConfigurationScreen>
          } 
        />
        <Route 
          path='/profile' 
          element={
            <InitialConfigurationScreen>
              <Profile />
            </InitialConfigurationScreen>
          }  
        />
        <Route 
          path='/success' 
          element={
            <InitialConfigurationScreen>
              <Success />
            </InitialConfigurationScreen>
          }
        />
        <Route 
          path='/error' 
          element={
            <InitialConfigurationScreen>
              <ErrorScreen />
            </InitialConfigurationScreen>
          }
        />
        <Route 
          path='/qrlink'
          element={
            // <InitialConfigurationScreen>
              <QrCodeScreen />
            // </InitialConfigurationScreen>
          }
        />
        <Route 
          path='/onlineshoplink' 
          element={
            // <InitialConfigurationScreen>
              <OnlineQrCodeScreen />
            // </InitialConfigurationScreen>
          }
        />
      </Routes>
    </>
  );
}

export default App;
