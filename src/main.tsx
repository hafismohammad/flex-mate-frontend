import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import store from './app/store'; 
import {SocketContextProvider} from './context/Socket'
import { NotificationProvider } from './context/NotificationContext ';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
<NotificationProvider>
<Provider store={store} >
      <SocketContextProvider>
    <App />
      </SocketContextProvider>
    </Provider>
</NotificationProvider>


);
