import { useContext } from "react";
import Cell from "./Cell";
import { Button, Grid } from "@mui/material";
import { ContextCreator } from "../Store/store";

const GridComp:React.FC=()=>{
  const {gridRef,handleChange,moveBlock}=useContext(ContextCreator)
    return(
       <div>
         {gridRef.current.map((row: any, rowIndex: number) => (
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
    )
}

export default GridComp;