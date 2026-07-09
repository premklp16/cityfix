import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({ items }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`flex flex-col bg-slate-950 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.16)] transition-all duration-300 z-40 ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Navigation</p>
            <p className="mt-2 text-lg font-semibold text-white">Workspace</p>
          </div>
        ) : (
          <div className="text-xl font-semibold">CF</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-4 rounded-3xl px-4 py-3 transition ${isActive
                ? 'bg-primary-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.18)]'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title={collapsed ? item.label : ''}
            >
              <div className={`text-lg ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </div>
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
