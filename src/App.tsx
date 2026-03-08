import { Sidebar } from './components/Sidebar';
import { MainBoard } from './components/MainBoard';

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content-area">
        <MainBoard />
      </main>
    </div>
  );
}

export default App;
