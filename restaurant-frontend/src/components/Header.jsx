  import React from 'react';

  function Header({ onLoginClick }) {
    return (
    <header className="flex justify-between items-center p-4 fixed w-full z-30 bg-transparent">
    <div className="text-white text-xl font-bold drop-shadow-md">Vendor Dashboard</div>
    <button
      onClick={onLoginClick}
      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
    >
      Login
    </button>
  </header>

    );
  }

  export default Header;
