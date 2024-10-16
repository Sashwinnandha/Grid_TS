import React, { lazy, Suspense } from "react";
import Input from "./Input";
import { Button } from "@mui/material";

const LazyGrid=lazy(()=>import("./Grid"))

interface Display {
  handleOpen: (a: string) => void;
  handleClose: () => void;
  handleForm: (e:any) => void;
  handleChange: (cell: string, index: number) => void;
  handleReset: () => void;
  moveBlock: (id:string,toCol:number,toRow:number) => void;
  addItem: (s: string,n:number) => void;
  items:{};
  grid: any;
  open:{
    new:boolean,
    update:boolean
  }
}
const DisplayGrid: React.FC<Display> = ({
  handleOpen,
  handleClose,
  handleForm,
  grid,
  handleReset,
  handleChange,
  moveBlock,
  addItem,
  items,
  open
}) => {
  const itemsArr=Object.keys(items).map((each:string)=>each.split("_")[0]);
  return (
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
        disabled={grid.length > 0}
        style={{ marginBottom: "10px" }}
      >
        Create Grid
      </Button>
      <Button
        variant="outlined"
        onClick={() => handleOpen("update")}
        disabled={grid.length === 0}
        style={{ marginBottom: "20px" }}
      >
        Update Grid
      </Button>
      <Button
        variant="outlined"
        onClick={handleReset}
        disabled={grid.length === 0}
        style={{ marginBottom: "20px" }}
      >
        Reset Grid
      </Button>

      <Input open={open} handleClose={handleClose} handleForm={handleForm} />

      {grid.length > 0 && (
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
            <LazyGrid grid={grid} handleChange={handleChange} moveBlock={moveBlock} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default DisplayGrid;
