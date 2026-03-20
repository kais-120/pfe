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
import HotelInfo from "./Pages/ServiceInfo/HotelInfo";
import SearchHotels from "./Pages/Search/SearchHotels";
import DatePicker from "./components/ui/DatePicker";
import RoomSelector from "./components/ui/RoomSelector";
import BookingClientInfo from "./Pages/Booking/BookingClientInfo";
import Service from "./dashboard/Partner/Service";
import AddLocation from "./dashboard/Partner/Service/Add/AddLocation";
import AddVehicle from "./dashboard/Partner/Service/Add/AddVehicle";
import AddAgency from "./dashboard/Partner/Service/Add/AddAgency";
import AddOffer from "./dashboard/Partner/Service/Add/AddOffer";

function App() {
  return (
    <>
  <Toaster />
    <Routes>
  <Route path="/test" element={<Test/>} />
  <Route path="/search" element={<SearchHotels/>} />
  <Route path="/" element={<Home/>} />
  <Route path="/hotel/:id" element={<HotelInfo/>} />
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
      <Route path="service" element={<Service />} />
      <Route path="service/hotel/add" element={<AddHotel/>} />
      <Route path="service/hotel/room/add" element={<AddRoom/>} />

      <Route path="service/agency/add" element={<AddAgency/>} />
      <Route path="service/agency/offer/add" element={<AddOffer />} />

      <Route path="service/location/add" element={<AddLocation />} />
      <Route path="service/location/vehicle/add" element={<AddVehicle />} />
      <Route path="bookings" element={<Booking/>} />

    </Route>
  </Route>
  </Route>

  <Route element={<RoleReq allow={["client"]} />}>
    <Route path="/booking" element={<BookingClientInfo />} />
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
