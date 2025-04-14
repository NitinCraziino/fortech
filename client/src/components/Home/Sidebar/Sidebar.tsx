import { BagAddOutline, OutlinePackageBox, Peoples } from "@/assets/iconsDynamic";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

type SidebarProps = {
  isAdmin: boolean; // or any appropriate type
  handleLogout: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isAdmin, handleLogout }) => {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "min-w-64 max-w-64 text-sm font-medium flex flex-col text-[#334155] sidebar group"
      )}
    >
      <div className="min-h-[70px] flex items-center justify-center relative py-2 px-4 group-[.collapsed]:px-3">
        <div className="cursor-pointer">
          <img
            src="/images/mainLogo.png"
            alt=""
            className="w-[130px] max-w-full group-[.collapsed]:max-w-[30px] transition-all"
          />
        </div>

        {/* Button for collapse sidebar */}
        {/* <button className="absolute left-full top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-[#F3F3F4] rounded-[2px] text-center transition-opacity opacity-0 group-hover:opacity-100">
          <ChevronsLeftRight className="min-w-[20px] inline" />
        </button> */}
      </div>

      <div className="px-4 group-[.collapsed]:px-3 pb-4 max-h-[calc(100vh-132px)] overflow-y-auto overflow-x-hidden">
        <ul className="flex flex-col gap-2">
          <li
            key="menu"
            className="min-h-[40px] flex items-center p-2 pt-4 group-[.collapsed]:px-0"
          >
            <p>Menu</p>
          </li>
          {isAdmin && (
            <li>
              <div
                onClick={() => navigate("/customers")}
                className={cn(
                  "gap-2 flex items-center p-2 transition-colors rounded-lg min-h-[40px] whitespace-nowrap hover:bg-primary hover:text-white hover:shadow-main cursor-pointer group-[.collapsed]:w-10 group-[.collapsed]:justify-center",
                  {
                    "bg-primary text-white shadow-main":
                      location.pathname === "/customers",
                  }
                )}
              >
                <span className="flex-grow-0 flex-shrink-0 flex-auto">
                  <Peoples />
                </span>
                <p className="block group-[.collapsed]:hidden">Customers</p>
              </div>
            </li>
          )}
          <li>
            <div
              onClick={() => navigate("/products")}
              className={cn(
                "gap-2 flex items-center p-2 transition-colors rounded-lg min-h-[40px] whitespace-nowrap hover:bg-primary hover:text-white hover:shadow-main cursor-pointer group-[.collapsed]:w-10 group-[.collapsed]:justify-center",
                {
                  "bg-primary text-white shadow-main":
                    location.pathname === "/products",
                }
              )}
            >
              <span className="flex-grow-0 flex-shrink-0 flex-auto">
                <OutlinePackageBox />
              </span>
              <p className="block group-[.collapsed]:hidden">Products</p>
            </div>
          </li>
          <li>
            <div
              onClick={() => navigate("/orders")}
              className={cn(
                "gap-2 flex items-center p-2 transition-colors rounded-lg min-h-[40px] whitespace-nowrap hover:bg-primary hover:text-white hover:shadow-main cursor-pointer group-[.collapsed]:w-10 group-[.collapsed]:justify-center",
                {
                  "bg-primary text-white shadow-main":
                    location.pathname === "/orders",
                }
              )}
            >
              <span className="flex-grow-0 flex-shrink-0 flex-auto">
                <BagAddOutline />
              </span>
              <p className="block group-[.collapsed]:hidden">Orders</p>
            </div>
          </li>
        </ul>
      </div>

      <div
        onClick={() => handleLogout()}
        className="mt-auto flex py-5 px-4 gap-3 border-t border-t-[#CBD5E1] cursor-pointer group-[.collapsed]:px-5"
      >
        <img src="/icons/logout.svg" alt="" />
        <p className="block group-[.collapsed]:hidden">Logout</p>
      </div>
    </div>
  );
};

export default Sidebar;
