import React, { useState } from "react";
import './App.css';
import Router from '../router/Router';  
import { MdSms } from "react-icons/md";
import Sidebar from "../src/components/sidebar/Sidebar.jsx";



function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  return (
    <>
    <Router />
    <div className="menuChatLateral">
          {isSidebarOpen && <Sidebar onClose={() => setIsSidebarOpen(false)} />}
          <button className="abrirChat" onClick={openSidebar}><MdSms className="MdSms" /></button>
          </div>  
    </>
  );
}

export default App;