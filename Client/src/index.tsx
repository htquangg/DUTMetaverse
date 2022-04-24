import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppRoute from '@tlq/router';
import store from '@tlq/store';

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement,
// );
// root.render(
//   <React.StrictMode>
//     <ChakraProvider>
//       <App />
//     </ChakraProvider>
//   </React.StrictMode>,
// );

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider>
        <AppRoute />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
