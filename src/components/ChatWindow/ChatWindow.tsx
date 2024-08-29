// src/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import './ChatWindow.css';
import { HOST_NAME, ENDPOINTS } from '../../constants'; // Import constants

interface ChatWindowProps {
    chatId: string;
    port: number;
    path: string;
}

interface Message {
    content: string;
    type: 'user' | 'response';
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, port, path }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [authToken, setAuthToken] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(scrollToBottom, [messages]);

    const authenticate = async () => {
        try {
            const authEndpoint = `${HOST_NAME}:${port}/login`;
            const response = await axios.post(authEndpoint, {
                username: 'yourUsername',
                password: 'yourPassword'
            });
            setAuthToken(response.data.token);
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        // Authenticate if necessary
        if (!authToken) {
            await authenticate();
        }

        // Add user message to chat
        setMessages((prevMessages) => [...prevMessages, { content: userInput, type: 'user' }]);

        // Call the Flask endpoint with user input
        const endpoint = `${HOST_NAME}:${port}/${path}`;
        axios.post(endpoint, { message: userInput }, {
            responseType: 'stream',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => {
                const reader = response.data.getReader();
                const decoder = new TextDecoder('utf-8');

                const read = async () => {
                    const { done, value } = await reader.read();
                    if (done) return;

                    const newMessage = decoder.decode(value);
                    setMessages(prevMessages => [
                        ...prevMessages,
                        { content: DOMPurify.sanitize(newMessage), type: 'response' }
                    ]);

                    read();  // Continue reading
                };

                read();
            }).catch(error => {
                console.error('Error streaming response:', error);
            });

        setUserInput('');  // Clear input field
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>Chat with {chatId}</h3>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.type}`}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;
