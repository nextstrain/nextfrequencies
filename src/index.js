/* L I B R A R I E S */
import React from "react";
import ReactDOM from "react-dom";
import Frequencies from "./frequencies/index";
import {makeProps} from "./transform";
import DATA from "../data/frequencies.json"
import { Introduction } from "./introduction";
console.log(DATA)

const renderApp = () => {
  ReactDOM.render(
    (
      <div>
        <Introduction DATA={DATA}/>
        <Frequencies {...makeProps(DATA)}/>
      </div>
    ),
    document.getElementById('root')
  );
};

renderApp();