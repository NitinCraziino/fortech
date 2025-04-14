import type React from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import { getPageTitle } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { logout } from "@/redux/slices/authSlice";

const Home:  React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const title = getPageTitle(location.pathname);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {user} = useSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout())
  }
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar handleLogout={handleLogout} isAdmin = {user.admin}/>
      <div className="w-full h-full">
        <Header name={user.name} title={title}/>
        <div className="border-t border-t-[#e9edf2] border-l border-l-[#e9edf2] w-full h-[calc(100vh-70px)] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Home;
