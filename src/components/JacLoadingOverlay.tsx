import { useState, useEffect } from 'react';

const JacLoadingOverlay = () => {
    const [loadingText, setLoadingText] = useState('');
    const fullText = 'Loading Jac Playground';
    const [dots, setDots] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        const textInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setLoadingText(fullText.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(textInterval);
            }
        }, 100);

        const dotsInterval = setInterval(() => {
            setDots(prev => {
                if (prev.length >= 3) return '';
                return prev + '.';
            });
        }, 500);

        return () => {
            clearInterval(textInterval);
            clearInterval(dotsInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full blur-xl animate-pulse"></div>

                <div className="relative z-10 flex items-center justify-center h-24 w-24 rounded-full bg-gray-800 border-2 border-blue-500 shadow-lg overflow-hidden">
                    <img
                        src="/jaseci.png"
                        alt="Jac Logo"
                        className="h-16 w-16 animate-spin-slow"
                    />
                </div>
            </div>

            <div className="mt-4 px-6 py-3 bg-gray-800 bg-opacity-70 rounded-lg shadow-lg border border-gray-700">
                <div className="text-blue-300 text-lg font-mono">
                    <span>{loadingText}</span>
                    <span className="text-blue-400">{dots}</span>
                    <span className="ml-1 inline-block w-2 h-4 bg-blue-400 animate-blink"></span>
                </div>
            </div>
        </div>
    );
};

export default JacLoadingOverlay;