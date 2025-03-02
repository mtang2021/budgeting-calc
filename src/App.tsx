import React from 'react';
import './App.css';
import BudgetCalculator from './components/BudgetCalculator';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Budget Calculator App</h1>
      </header>
      <main>
        <BudgetCalculator />
      </main>
    </div>
  );
}

export default App;
