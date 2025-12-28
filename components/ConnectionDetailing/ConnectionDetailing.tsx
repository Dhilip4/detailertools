import React from 'react';
import BoltSelector from './BoltSelector';

const ConnectionDetailing: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-black text-gray-300 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-[#76b900] mb-2">Connection Detailing</h1>
                <p className="text-gray-400 mb-6">
                    Interactive tools for bolt clearances, edge distances, and hole dimensions based on AISC Manual Tables 7-15, J3.3, and J3.4.
                </p>

                <BoltSelector />
            </div>
        </div>
    );
};

export default ConnectionDetailing;
