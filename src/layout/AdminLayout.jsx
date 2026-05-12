import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f3f4f8] p-4 md:p-6">
      <div className="flex gap-5 max-w-[1600px] mx-auto">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="bg-[#f8f8fb] rounded-[32px] px-5 py-5 md:px-6 md:py-6">
            <Topbar />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}