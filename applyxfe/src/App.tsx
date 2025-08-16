import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Ikigai from './page/ikigai-career-demo'
import IkigaiResults from './page/ikigai-results'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Ikigai ></Ikigai >}></Route>
        <Route path='/ikigai-career' element={<Ikigai ></Ikigai >}></Route>
        <Route path='/ikigai-result/:session_id' element={<IkigaiResults />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
