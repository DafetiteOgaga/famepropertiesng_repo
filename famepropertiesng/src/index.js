import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from './hooks/allAuth/authContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <GoogleOAuthProvider clientId={"216439767175-mi51mmo7b22degu0b6b1pjbdk9n8nu5c.apps.googleusercontent.com"}>
        <HashRouter>
          <App />
        </HashRouter>
      </GoogleOAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
