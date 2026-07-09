import React from 'react';
import { FaHeart, FaGithub, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">CityFix</h3>
            <p className="text-sm leading-6 text-slate-400">
              Empowering citizens to build better cities through faster reporting, clear updates, and stronger community collaboration.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Quick links</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="transition hover:text-white">About Us</a></li>
              <li><a href="#" className="transition hover:text-white">How it Works</a></li>
              <li><a href="#" className="transition hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Connect</h3>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="transition hover:text-white text-xl"><FaTwitter /></a>
              <a href="#" className="transition hover:text-white text-xl"><FaFacebook /></a>
              <a href="#" className="transition hover:text-white text-xl"><FaGithub /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex md:items-center md:justify-between">
          <p>&copy; {currentYear} CityFix. All rights reserved.</p>
          <p className="mt-3 md:mt-0 flex items-center gap-1">
            Made with <FaHeart className="text-danger-500" /> for better cities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
