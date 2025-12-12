import { BalloonMap } from './components/BalloonMap';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>WindBorne Balloon Constellation Tracker</h1>
        <p>Real-time tracking of weather balloons with local atmospheric conditions</p>
      </header>
      <BalloonMap />
    </div>
  );
}

export default App;
