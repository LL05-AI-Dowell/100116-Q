import { Route, Routes } from "react-router-dom";
import useDowellLogin from "./hooks/useDowellLogin";
import LandingPage from "./pages/LandingPage/LandingPage";
import Profile from "./pages/Profile/Profile";

function App() {
  useDowellLogin();

  return (
    <Routes>
      <Route path="/" Component={LandingPage} />
      <Route path="/profile" Component={Profile} />
    </Routes>
    // <Router>
    //   <Switch>
    //     <Route path="/" component={<LandingPage />} />
    //     {/* <Route path="/profile" component={<Profile />} /> */}
    //     {/* Other routes */}
    //   </Switch>
    // </Router>
  )
}

export default App
