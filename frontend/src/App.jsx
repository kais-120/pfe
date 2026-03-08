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
import Users from "./dashboard/Admin/Users";
import PartnerDocument from "./dashboard/Admin/PartnerDocument";
import PartnerDocumentInfo from "./dashboard/Admin/PartnerDocumentInfo";
import { Toaster } from "./components/ui/toaster";

function App() {
  const route = window.location.host;
  const subdomain = route.split(".");
  return (
    <>
  <Toaster />
    <Routes>
  <Route path="/test" element={<PartnerFileReq/>} />
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
    <Route path="/partner/dashboard" element={<HomeDashboard/>}>
    </Route>
  </Route>
  <Route element={<RoleReq allow={["admin"]} />}>
    <Route path="/dashboard" element={<HomeDashboard/>}>
      <Route path="users" element={<Users />} />
      <Route path="document/partner" element={<PartnerDocument />} />
      <Route path="document/partner/:id" element={<PartnerDocumentInfo />} />
    </Route>
    </Route>
  </Route>
</Routes>
</>
   
  );
}

export default App;
