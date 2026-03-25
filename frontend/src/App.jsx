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
import ServiceAirline from "./dashboard/Partner/Service/Fetsh/ServiceAirline";
import AddAirline from "./dashboard/Partner/Service/Add/AddAirline";
import AddFlight from "./dashboard/Partner/Service/Add/AddFlight";
import AddAirlineOffer from "./dashboard/Partner/Service/Add/AddAirlineOffer";
import AddVoyageAgency from "./dashboard/Partner/Service/Add/AddVoyageAgency";
import AddTravelOption from "./dashboard/Partner/Service/Add/AddTravelOption";
import AddCircuit from "./dashboard/Partner/Service/Add/AddCircuit";
import ForgotPassword from "./Auth/ForgotPassword";
import VerifyOtp from "./Auth/VerifyOtp";
import ResetPassword from "./Auth/ResetPassword";
import Settings from "./Auth/Settings";
import HomeLocation from "./HomeLocation";
import QrScannerPage from "./dashboard/Partner/QrScannerPage";

function App() {
  return (
    <>
  <Toaster />
    <Routes>
  <Route path="/setting" element={<Settings/>} />
  <Route path="/test" element={<Test/>} />
  <Route path="/search" element={<SearchHotels/>} />
  <Route path="/forgot-password" element={<ForgotPassword/>} />
  <Route path="/verify-otp/:hash" element={<VerifyOtp link={"/forgot-password"} type="forgot-password" />} />
  <Route path="/reset-password/:hash" element={<ResetPassword/>} />
  <Route path="/" element={<Home/>} />
  <Route path="/location" element={<HomeLocation/>} />
  <Route path="/hotel/:id" element={<HotelInfo/>} />
  <Route path="/partner" element={<DocumentPartner/>} />
  <Route element={<AuthReq />}>
    <Route path="/login" element={<Login/>} />
    <Route path="/signup/partner" element={<PartnerSignUp />} />
    <Route path="/signup" element={<SignUp/>} />
    <Route path="/verify/:hash" element={<VerifyOtp link={"/"} type="register" />}/>
  </Route>
  <Route element={<RoleReq allow={["partner"]} />}>
  <Route element={<PartnerFileReq />}>
    <Route path="/partner/dashboard" element={<HomeDashboard/>}>

      <Route path="qr-scanner" element={<QrScannerPage />} />
      <Route path="service" element={<Service />} />

      <Route path="service/hotel/add" element={<AddHotel/>} />
      <Route path="service/hotel/room/add" element={<AddRoom/>} />

      <Route path="service/agency/add" element={<AddAgency/>} />
      <Route path="service/agency/offer/add" element={<AddOffer />} />

      <Route path="service/location/add" element={<AddLocation />} />
      <Route path="service/location/vehicle/add" element={<AddVehicle />} />

      <Route path="service/airline/add" element={<AddAirline />} />
      <Route path="service/airline/flight/add" element={<AddFlight />} />
      <Route path="service/airline/offer/add" element={<AddAirlineOffer />} />

      <Route path="service/voyage/add" element={<AddVoyageAgency />} />
      <Route path="service/voyage/travel/add" element={<AddTravelOption />} />
      <Route path="service/voyage/circuit/add" element={<AddCircuit />} />


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
