import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to the backend URL
        const backendUrl = 'http://localhost:5000'; // Adjust if your backend runs on a different port
        const newSocket = io(backendUrl);

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Connected to Socket.io server');
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.io server');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
