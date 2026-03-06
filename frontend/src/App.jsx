import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import HomeDashboard from "./dashboard/Home";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import AuthReq from "./Req/AuthReq";
import Test from "./Test";
import RoleReq from "./Req/RoleReq";
import OtpPage from "./Auth/OtpPage";
import DocumentPartner from "./Auth/DocumentPartner";
import PartnerSignUp from "./Auth/PartnerSignUp";
import PartnerFileReq from "./Req/PartnerFileReq";
import PendingSend from "./Auth/partnerDocument/PendingSend";

function App() {
  const route = window.location.host;
  const subdomain = route.split(".");
  return (
<Routes>
  <Route path="/test" element={<PendingSend/>} />
  <Route path="/" element={<Home/>} />
  <Route path="/partner" element={<DocumentPartner/>} />
  <Route element={<AuthReq />}>
    <Route path="/login" element={<Login/>} />
    {subdomain.includes("partner") ? 
    <Route path="/signup" element={<PartnerSignUp />} />
    :
    <Route path="/signup" element={<SignUp/>} />
    }
    <Route path="/verify/:hash" element={<OtpPage />}/>
  </Route>
  <Route element={<RoleReq allow={["admin","partner"]} />}>
  <Route element={<PartnerFileReq />}>
    <Route path="/dashboard" element={<HomeDashboard/>} />
  </Route>
  </Route>
</Routes>
   
  );
}

export default App;
