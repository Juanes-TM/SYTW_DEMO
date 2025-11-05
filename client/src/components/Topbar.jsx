const Topbar = () => {
  return (
    <header className="w-full bg-white shadow-sm flex justify-between items-center px-6 py-3">
      <h1 className="text-lg font-semibold text-teal-700">Panel de control</h1>
      <div className="flex items-center gap-3">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <span className="font-medium">Jose</span>
      </div>
    </header>
  );
};

export default Topbar;
