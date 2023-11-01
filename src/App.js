import { useState } from 'react';
import './App.css';
import LandingScreen from './Components/LandingScreen/LandingScreen';

function App() {
  const [pageScroll, setPageScroll] = useState(false);

  return (
    <div className="App" onScroll={() => setPageScroll(true)}>
      <LandingScreen scrollValue={pageScroll} />
    </div>
  );
}

export default App;
