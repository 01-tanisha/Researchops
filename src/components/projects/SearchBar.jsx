import "./SearchBar.css";

function SearchBar({ searchTerm, setSearchTerm }) {

    return (

        <input
            className="search-project"
            type="text"
            placeholder="Search Projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />

    );

}

export default SearchBar;