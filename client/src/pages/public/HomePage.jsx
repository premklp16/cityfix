import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBullhorn, FaMapMarkedAlt, FaChartLine, FaArrowRight } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import MapDisplay from '../../components/map/MapDisplay';
import ReportCard from '../../components/report/ReportCard';
import Spinner from '../../components/common/Spinner';
import { getReports } from '../../api/reportApi';

const HomePage = () => {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        // Increase the limit so newly created reports appear on the public map
        const res = await getReports({ limit: 10, sort: 'newest' });
        setRecentReports(res.data.data.reports);
      } catch (error) {
        console.error("Failed to load recent reports", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 mix-blend-multiply"></div>
            {/* Using a subtle pattern instead of an image to keep it clean */}
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
            <Badge text="Crowdsourced Civic Platform" className="mb-6 bg-slate-800 text-primary-400 border border-slate-700" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl">
              Fix Your City, <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">
                Together.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
              Report local civic issues like potholes, broken streetlights, or garbage dumps. 
              Track progress, interact with authorities, and improve your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/report" className="w-full sm:w-auto">
                <Button size="lg" className="w-full shadow-lg shadow-primary-500/30 font-bold text-base px-8">
                  Report an Issue Now
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-base px-8">
                  Join Your Community
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How CityFix Works</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">A simple, transparent process to get your local problems resolved.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 rotate-3">
                  <FaBullhorn />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">1. Report</h3>
                <p className="text-slate-600 leading-relaxed">Snap a photo, add a description, and pinpoint the location of the issue on the map.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 -rotate-3">
                  <FaMapMarkedAlt />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">2. Assign</h3>
                <p className="text-slate-600 leading-relaxed">The issue is automatically routed to the correct department and assigned to an officer.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 rotate-3">
                  <FaChartLine />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">3. Resolve</h3>
                <p className="text-slate-600 leading-relaxed">Track the progress in real-time. Get notified when the issue is resolved.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map Preview Section */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Live Reports Map</h2>
                <p className="text-slate-600 max-w-2xl text-lg">See what's happening around your city in real-time.</p>
              </div>
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 group">
                View All Reports <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
              <MapDisplay reports={recentReports} height="500px" />
            </div>
          </div>
        </section>

        {/* Recent Reports Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Recently Reported Issues</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">The latest civic problems reported by citizens.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : recentReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentReports.map(report => (
                  <ReportCard key={report._id} report={report} />
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-xl border border-slate-100">
                No recent reports found. Be the first to report an issue!
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link to="/login">
                <Button variant="secondary" size="lg" className="px-8 font-medium">Browse All Reports</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Helper Badge component since we can't easily import it here due to the layout of the code generator
const Badge = ({ text, className = '' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${className}`}>
    {text}
  </span>
);

export default HomePage;
