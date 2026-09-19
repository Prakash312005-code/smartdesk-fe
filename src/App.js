import { BrowserRouter, Routes, Route } from "react-router-dom";

import RaiseTicket from "./pages/raiseticket/RaiseTicket.jsx";
import Confirmation from "./pages/confirmation/Confirmation.jsx";
import Login from "./pages/login/Login.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import TicketList from "./pages/ticketlist/TicketList.jsx";
import TicketDetail from "./pages/ticketdetail/TicketDetail.jsx";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RaiseTicket />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
        <Route path="/admin/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;