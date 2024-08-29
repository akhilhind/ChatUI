// src/components/Menu.tsx
import React from 'react';

interface MenuProps {
    onSelectChat: (chatId: string) => void;
}

const Menu: React.FC<MenuProps> = ({ onSelectChat }) => {
    return (
        <div className="menu">
            <h3>Chats</h3>
            <ul>
                <li><button onClick={() => onSelectChat('chat1')}>Chat 1</button></li>
                <li><button onClick={() => onSelectChat('chat2')}>Chat 2</button></li>
                <li><button onClick={() => onSelectChat('chat3')}>Chat 3</button></li>
                <li><button onClick={() => onSelectChat('chat4')}>Chat 4</button></li>
            </ul>
        </div>
    );
};

export default Menu;
