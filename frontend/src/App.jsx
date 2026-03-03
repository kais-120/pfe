import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import HomeDashboard from "./dashboard/Home";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import AuthReq from "./Req/AuthReq";
import Test from "./Test";
import RoleReq from "./Req/RoleReq";
import OtpPage from "./Auth/OtpPage";

function App() {
  return (
<Routes>
  <Route path="/" element={<Home/>} />
  <Route element={<AuthReq />}>
    <Route path="/login" element={<Login/>} />
    <Route path="/signup" element={<SignUp/>} />
    <Route path="/verify/:hash" element={<OtpPage />}/>
  </Route>
  <Route element={<RoleReq allow={["admin"]} />}>
    <Route path="/dashboard" element={<HomeDashboard/>} />
  </Route>
</Routes>
   
  );
}

export default App;
