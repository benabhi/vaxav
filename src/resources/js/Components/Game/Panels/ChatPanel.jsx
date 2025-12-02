import React, { useState } from 'react';
import { ChatIcon } from '../../RetroUI/RetroIcons';

export const PanelIcon = <ChatIcon />;

const ChatPanel = () => {
    const [messages] = useState([
        { user: 'JUGADOR1', text: '¿Alguien para una misión?' },
        { user: 'CMD_IA', text: 'Apoyo requerido en Sector 7.' },
        { user: 'COMERCIANTE', text: 'Vendo munición, barata.' },
    ]);

    return (
        <div className="p-2 h-full bg-[#000a05] text-[#00ffaa] font-mono text-xs flex flex-col">
            <h2 className="text-sm font-bold mb-2 border-b border-[#005533] pb-1">ENLACE_COMMS</h2>
            <div className="flex-1 overflow-y-auto space-y-1 mb-2 pr-1">
                {messages.map((msg, idx) => (
                    <div key={idx} className="p-1 hover:bg-[#001100]">
                        <span className="font-bold text-[#00ffaa] opacity-80">[{msg.user}]: </span>
                        <span className="text-[#00ffaa] opacity-60">{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center border border-[#005533] bg-[#000500]">
                <span className="pl-2 text-[#00ffaa]">{">"}</span>
                <input
                    type="text"
                    placeholder="TRANSMITIR..."
                    className="w-full p-2 bg-transparent text-[#00ffaa] focus:outline-none placeholder-[#005533]"
                />
            </div>
        </div>
    );
};

export default ChatPanel;
