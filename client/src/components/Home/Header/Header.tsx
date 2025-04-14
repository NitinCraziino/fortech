import React from "react";
interface HeaderProps {
  title: string;
  name: string;
}

const Header: React.FC<HeaderProps> = ({ title, name }) => {

  return (
    <div className="min-h-[70px] flex items-center justify-between gap-5 px-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {/* <button className="ms-auto">
        <img src={bellIcon} alt="bell" />
      </button> */}

      <p className="text-lg font-semibold">Hello, {name} !</p>
    </div>
  );
};

export default Header;
