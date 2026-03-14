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
import AddAgent from "./dashboard/Admin/AddAgent";
import AddHotel from "./dashboard/Partner/Service/Add/AddHotel";
import ServiceHotel from "./dashboard/Partner/Service/Fetsh/ServiceHotel";
import AddRoom from "./dashboard/Partner/Service/Add/AddRoom";
import Booking from "./dashboard/Partner/booking";

function App() {
  return (
    <>
  <Toaster />
    <Routes>
  <Route path="/test" element={<Test/>} />
  <Route path="/" element={<Home/>} />
  <Route path="/partner" element={<DocumentPartner/>} />
  <Route element={<AuthReq />}>
    <Route path="/login" element={<Login/>} />
    <Route path="/signup/partner" element={<PartnerSignUp />} />
    <Route path="/signup" element={<SignUp/>} />
    <Route path="/verify/:hash" element={<OtpPage />}/>
  </Route>
  <Route element={<RoleReq allow={["partner"]} />}>
  <Route element={<PartnerFileReq />}>
    <Route path="/partner/dashboard" element={<HomeDashboard/>}>
      <Route path="service" element={<ServiceHotel />} />
      <Route path="service/add" element={<AddHotel/>} />
      <Route path="bookings" element={<Booking/>} />
      <Route path="service/hotel/room/add" element={<AddRoom/>} />

    </Route>
  </Route>
  </Route>

  <Route element={<RoleReq allow={["admin","agent"]} />}>
    <Route path="/dashboard" element={<HomeDashboard/>}>
      <Route path="users" element={<Users />} />
      <Route path="users/create" element={<AddAgent />} />
      <Route path="document/partner" element={<PartnerDocument />} />
      <Route path="document/partner/:id" element={<PartnerDocumentInfo />} />
    </Route>
    </Route>
</Routes>
</>
   
  );
}

export default App;
