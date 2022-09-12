import ReactDOM from 'react-dom';
import React from 'react'
import App from '@/App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import "./assets/styles/index.scss";



ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>,
    document.getElementById('root')
  );

export default {}