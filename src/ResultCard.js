import React from 'react';
import './ResultCard.css';

// Stateless functional component
const ResultCard = ({ result }) => {
    const { id, name, itemsText, address, typedText } = result;
    const getHighlightedText = (text, customClass) => {
        return text.toLowerCase().includes(typedText.toLowerCase()) ?
        <div className={customClass}>
            {text.slice(0, text.indexOf(typedText))} 
            <span style={{ color: '#4E8EEE', fontWeight: 'bold'}}>{typedText}</span>
            {text.slice(text.indexOf(typedText) + typedText.length)}
        </div>:
        <div className={customClass}>{text}</div>;
    };
    return (
        <div className="ResultCard">
            {
                getHighlightedText(id,'id')
            }
            {
                getHighlightedText(name, 'name')
            }
            {
                itemsText && 
                <div className="itemsText"><span class="dot"></span> { itemsText }</div>
            }
            {
                getHighlightedText(address, 'address')
            }
        </div>
    );    
};

export default ResultCard;
