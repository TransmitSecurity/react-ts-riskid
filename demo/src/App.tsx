import logo from './logo.svg';
import { TSAccountProtectionProvider, DRSConfigOptions } from '@transmitsecurity/riskid-reactjs-ts';
import InnerComponent from './InnerComponent';
import './App.css';

function App() {
  const accountProtectionOptions: DRSConfigOptions = {
    userId: 'demo-user-id',
    initSuccessLog: 'Detection and Response SDK successfully initialized',
    enableSessionToken: true,
  };

  return (
    <TSAccountProtectionProvider clientId={'abc1234.warehouse.acme.riskid.local'} options={accountProtectionOptions}>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <InnerComponent/>
        <h1>
          ReactJS AccountProtection Demo
        </h1>
      </header>
    </div>
    </TSAccountProtectionProvider>
  );
}

export default App;
