import React from "react";
import Cell from "./Cell";
import Input from "./Input";
import { Button, Grid } from "@mui/material";

interface Display {
  handleOpen: (a: string) => void;
  handleClose: () => void;
  handleForm: (e:any) => void;
  handleChange: (cell: string, index: number) => void;
  handleReset: () => void;
  moveBlock: (id:string,toCol:number,toRow:number) => void;
  addItem: (s: string) => void;
  items:string[];
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
              onClick={() => addItem("item1")}
              disabled={items.includes("item1")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 1<br />
              (1 Block)
            </Button>
            <Button
              onClick={() => addItem("item2")}
              disabled={items.includes("item2")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 2<br />
              (3 Blocks)
            </Button>
            <Button
              onClick={() => addItem("item3")}
              disabled={items.includes("item3")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 3<br />
              (4 Blocks)
            </Button>
            <Button
              onClick={() => addItem("item4")}
              disabled={items.includes("item4")}
              variant="contained"
              sx={{ margin: "0px 20px" }}
            >
              Add Item 4<br />
              (Group of 3 Blocks)
            </Button>
          </div>

          {grid.map((row: any, rowIndex: number) => (
            <Grid item xs={12} key={rowIndex}>
              <Grid container justifyContent="center">
                {row.map((cell: any, colIndex: number) => {
                  if (colIndex === 0 && rowIndex === 0) {
                    return (
                      <div
                        key={colIndex}
                        style={{
                          border: "1px solid grey",
                          color: "black",
                          width: "57px",
                        }}
                      >
                        {" "}
                      </div>
                    );
                  } else if (colIndex === 0) {
                    return (
                      <Button
                        key={colIndex}
                        variant="outlined"
                        sx={{ border: "1px solid grey", color: "black" }}
                        onClick={() => handleChange(cell.id, rowIndex)} // Note: Adjusted for any errors in typing
                      >
                        {cell ? cell.id : ""}{" "}
                        {/* Display the text property if the cell is not null */}
                      </Button>
                    );
                  } else if (rowIndex === 0) {
                    return (
                      <Button
                        key={colIndex}
                        variant="outlined"
                        sx={{ border: "1px solid grey", color: "black" }}
                        onClick={() => handleChange(cell.id, colIndex)}
                      >
                        {cell ? cell.id : ""}{" "}
                        {/* Display the text property if the cell is not null */}
                      </Button>
                    );
                  } else {
                    return (
                      <Grid item key={colIndex}>
                        <Cell
                          rowIndex={rowIndex}
                          colIndex={colIndex}
                          cell={cell}
                          moveBlock={moveBlock}
                        />
                      </Grid>
                    );
                  }
                })}
              </Grid>
            </Grid>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayGrid;
