import { useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';

const Dashboard = ({ activeTab, children }) => {
    const [toggleSidebar, setToggleSidebar] = useState(false);

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setToggleSidebar(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when navigating (tab changes)
    useEffect(() => {
        setToggleSidebar(false);
    }, [activeTab]);

    return (
        <>
            <main className="flex min-h-screen mt-16 sm:mt-20">
                {/* Desktop Sidebar — always visible on lg+ */}
                <div className="hidden lg:block w-64 shrink-0">
                    <Sidebar activeTab={activeTab} />
                </div>

                {/* Mobile Sidebar — backdrop overlay */}
                {toggleSidebar && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                        onClick={() => setToggleSidebar(false)}
                    />
                )}

                {/* Mobile Sidebar — slide-in drawer */}
                <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:hidden ${toggleSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar} />
                </div>

                <div className="flex-1 min-h-screen">
                    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 pb-6 overflow-hidden">
                        <button
                            onClick={() => setToggleSidebar(true)}
                            className="lg:hidden flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow text-white w-fit mb-2 active:scale-95 transition-transform"
                        >
                            <MenuIcon fontSize="small" /> <span>Menu</span>
                        </button>

                        {children}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Dashboard;
