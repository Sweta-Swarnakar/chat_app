import React from "react";
import "./styles.css";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";


export default function MainContainer() {
  return (
    <div className="main-conatainer">
      <Sidebar />
      <Outlet/>
    </div>
  );
}
