import React, { Component } from 'react';
import './SearchBar.css';
import { close, search } from './assets/icons/icons';
import SearchBarData from './SearchBarData';
import ResultCard from './ResultCard';


//https://davidwalsh.name/javascript-debounce-function
const debounce = (func, wait, immediate)  => {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typedText: '',
            searchResults: undefined,
            hoveredCardId: undefined,
            keyPressStarted: false,
        };
        this.autocompleteSearchDebounced = debounce(this.autocompleteSearch, 300);
    }

    componentDidMount() {
        const el = document.getElementById('search-input');
        el && el.addEventListener("keydown", e => this.handleArrowKeys(e));
    }

    componentWillUnmount() {
        const el = document.getElementById('search-input');
        el && el.removeEventListener("keydown", e => this.handleArrowKeys(e));
    }

    handleArrowKeys(e) {
        if(e.which === 38 || e.which === 40) {
            e.preventDefault();
            let newCardIndex;
            const { searchResults, hoveredCardId } = this.state;
            const currentCardIndex = searchResults.findIndex(item => item.id === hoveredCardId);
            if(currentCardIndex !== -1) {
                if(e.which === 38) {
                    newCardIndex = (currentCardIndex - 1) < 0 ? (searchResults.length - 1) : (currentCardIndex - 1);
                }
                if(e.which === 40) {
                    newCardIndex = (currentCardIndex + 1) > (searchResults.length - 1) ? 0 : (currentCardIndex + 1);
                }
            } else {
                newCardIndex = e.which !== 38 ? 0 : searchResults.length - 1;
            }
            this.setState({
                hoveredCardId: searchResults[newCardIndex]['id'],
                typedText: searchResults[newCardIndex]['name'],
                keyPressStarted: true
            }, () => {
                const element = document.getElementById(this.state.hoveredCardId);
                element.scrollIntoView({ block: e.which === 38 ? 'start' : 'end',  behavior: 'smooth' });
            });
        }
    }

    itemContainsSearchedText(item, text) {
        const textContains = (item) => item.toLowerCase().includes(text.toLowerCase());
        if (textContains(item.id) || textContains(item.name) ||
            textContains(item.address) || textContains(item.pincode)) return true;
        if (item.items.find(d => textContains(d))) return true;
    }

    getMatchingItems(text) {
        const matchingItems = 
        SearchBarData.filter(item => 
            this.itemContainsSearchedText(item, text)
        );
        return matchingItems;
    }

    autocompleteSearch = text => {
        this.setState({ searchResults: this.getMatchingItems(text) });
    };

    handleSearch(e) {
        this.setState({
            typedText: e.target.value
        }, () => {
            this.state.typedText.length && this.autocompleteSearchDebounced(this.state.typedText);
        });
    }

    searchByText(text) {
        this.setState({
            typedText: text
        }, () => {
            this.state.typedText.length && this.autocompleteSearchDebounced(this.state.typedText);
        });
    }

    getBorderStyle(i, searchResults) {
        return (i === searchResults.length - 1) ? 
            { border: "none", borderBottomLeftRadius: "7px", borderBottomRightRadius: "7px" } : {}
    }

    render() {
        const { typedText, searchResults, hoveredCardId, keyPressStarted } = this.state;
        return (
            <div className="SearchBarContainer">
                <img id='search' src={search} alt={'search icon'} />
                <img id='close' src={close} alt={'close icon'} onClick={e => this.setState({
                    typedText: '',
                    searchResults: undefined,
                    hoveredCardId: undefined,
                })}/>
                <input type="search" 
                    placeholder='Search users by ID, address, name, pincode'
                    value={typedText}
                    onKeyUp={e => e.which === 13 && this.handleSearch(e)}
                    onChange={e => this.handleSearch(e)}
                    id='search-input'
                    style={ typedText.length > 0 ? { borderBottomLeftRadius: "unset", borderBottomRightRadius: "unset" } : {}}
                />
                {
                    searchResults && searchResults.length > 0 && typedText.length > 0 && 
                    <ul onMouseMove={e => keyPressStarted && this.setState({ keyPressStarted: false })}>
                        {
                            searchResults.map((result, i) => {
                                const textContains = (item) => item.toLowerCase().includes(typedText.toLowerCase());
                                const itemsText = result.items.find(d => textContains(d)) ? `“${typedText}” found in items` : undefined;
                                return <li key={i} 
                                        id={result.id}
                                        className={ result.id === hoveredCardId ? 'hovered' : ''}
                                        style={this.getBorderStyle(i, searchResults)}
                                        onMouseEnter={e => !keyPressStarted && this.setState({ hoveredCardId: result.id })}
                                        onMouseLeave={e => !keyPressStarted && this.setState({ hoveredCardId: undefined })}
                                        onClick={e => this.searchByText(result.name)}>
                                    <ResultCard result={{ itemsText, ...result, typedText }} />
                                </li>
                            })
                        }
                    </ul>
                }
                {
                    searchResults && searchResults.length === 0 && typedText.length > 0 &&
                    <ul>
                        <div className="no-user-card">
                            No users found
                        </div>
                    </ul>
                }
            </div>
        );
    }
}

export default SearchBar;