import MyAppBar from "./components/AppBar";
import BookList from "./components/BookList";
import background from "./img/parchemnt.png"

function App() {
    return (
        <div className="App" style={{backgroundImage:`url(${background})`, backgroundSize: 'cover',backgroundRepeat: 'no-repeat'}}>
            <MyAppBar>
            </MyAppBar>
            <BookList>
            </BookList>
        </div>
    );
}

export default App;
