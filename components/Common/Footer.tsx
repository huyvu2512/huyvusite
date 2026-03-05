import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center py-6 text-gray-500 mt-8">
            <div className="container mx-auto flex items-center justify-center gap-2 px-4">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-5 h-5 object-contain"
                />
                <span className="text-xs sm:text-sm">
                    © {new Date().getFullYear()} HUYVU2512 -{' '}
                    <a
                        href="https://beacons.ai/huyvu2512"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-indigo-500 hover:text-amber-500 transition-colors"
                    >
                        Huy Vũ
                    </a>
                    . All rights reserved.
                </span>
            </div>
        </footer>
    );
};

export default Footer;