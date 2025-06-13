// import './index.css'; 
// // import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from "./App";

// ReactDOM.createRoot(document.getElementById('root')).render(
//   // <React.StrictMode>
//     <App />
//   /* </React.StrictMode> */
// );

import './index.css';
import ReactDOM from 'react-dom/client';
import App from "./App";
import { Provider } from 'react-redux';
import store from './app/store'; // Make sure this path is correct

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
