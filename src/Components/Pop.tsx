import React from "react";


import DisplayGrid from "./DisplayGrid";
import { ContextProvider } from "../Store/store";

const App: React.FC = () => {
  return (
    <ContextProvider>
      <DisplayGrid />
    </ContextProvider>
  );
};

export default App;
