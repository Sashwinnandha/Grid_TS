import React, { lazy, Suspense, useContext } from "react";
import Input from "./Input";
import { Button } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ContextCreator } from "../Store/store";

const LazyGrid=lazy(()=>import("./Grid"))

const DisplayGrid: React.FC = () => {
  const {handleChange,handleClose,handleForm,handleOpen,handleReset,moveBlock,addItem,gridRef,blockRef,open}=useContext(ContextCreator);
  const itemsArr=Object.keys(blockRef.current).map((each:string)=>each.split("_")[0]);
  return (

    <DndProvider backend={HTML5Backend}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "90vh",
        width: window.innerWidth - 60,
        backgroundColor: "#f9f9f9",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "coral" }}>
        Drag & Drop Grid App
      </h2>
      <Button
        variant="outlined"
        onClick={() => handleOpen("new")}
        disabled={gridRef.current.length > 0}
        style={{ marginBottom: "10px" }}
      >
        Create Grid
      </Button>
      <Button
        variant="outlined"
        onClick={() => handleOpen("update")}
        disabled={gridRef.current.length === 0}
        style={{ marginBottom: "20px" }}
      >
        Update Grid
      </Button>
      <Button
        variant="outlined"
        onClick={handleReset}
        disabled={gridRef.current.length === 0}
        style={{ marginBottom: "20px" }}
      >
        Reset Grid
      </Button>

      <Input open={open} handleClose={handleClose} handleForm={handleForm} />

      {gridRef.current.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <Button
              onClick={() => addItem("item1",1)}
              disabled={itemsArr.includes("i1")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 1<br />
              (1 Block)
            </Button>
            <Button
              onClick={() => addItem("item2",3)}
              disabled={itemsArr.includes("i2")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 2<br />
              (3 Blocks)
            </Button>
            <Button
              onClick={() => addItem("item3",4)}
              disabled={itemsArr.includes("i3")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 3<br />
              (4 Blocks)
            </Button>
            <Button
              onClick={() => addItem("item4",3)}
              disabled={itemsArr.includes("i4")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 4<br />
              (Group of 3 Blocks)
            </Button>
          </div>
          <Suspense fallback={<h2 style={{color:"black"}}>Loading Grid...</h2>}>
            <LazyGrid />
          </Suspense>
        </div>
      )}
    </div>
    </DndProvider>
  );
};

export default DisplayGrid;
