import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Paper,
} from "@mui/material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "BLOCK";

interface BlockProps {
  id: string;
  text: string;
}

const Block: React.FC<BlockProps> = ({ id, text }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Paper
      ref={drag}
      style={{
        padding: "8px",
        margin: "4px",
        backgroundColor: "#b0b0b0",
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        textAlign: "center",
        width: "100%",
      }}
    >
      {text}
    </Paper>
  );
};

interface CellType {
  id: string;
  text: string;
}

type MoveBlockFunction = (id: string, rowIndex: number, colIndex: number) => void;

interface CellProps {
  rowIndex: number;
  colIndex: number;
  cell: CellType | null; // cell can be null if it's empty
  moveBlock: MoveBlockFunction;
}

const Cell: React.FC<CellProps> = ({ rowIndex, colIndex, cell, moveBlock }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item: { id: string }) => {
      moveBlock(item.id, rowIndex, colIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        width: "60px",
        height: "50px",
        backgroundColor: isOver ? "#e0e0e0" : cell ? "#d0d0d0" : "#f0f0f0",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {cell && <Block id={cell.id} text={cell.text} />}
    </div>
  );
};

const App: React.FC = () => {
  const [open, setOpen] = useState({
    new: false,
    update: false,
  });
  const [grid, setGrid] = useState<any>(JSON.parse(localStorage.getItem("blocks") || '[]'));
  const [rows, setRows] = useState<number>(Number(localStorage.getItem("rows")) || 0);
  const [columns, setColumns] = useState<number>(Number(localStorage.getItem("columns")) || 0);
  const [blocks, setBlocks] = useState<{ [key: string]: CellType }>({});
  const [items, setItems] = useState<string[]>(JSON.parse(localStorage.getItem("items") || '[]'));
  const[action,setAction]=useState<string|null>(null);

  const countRef = useRef<number>(Number(localStorage.getItem("count")) || 0);
  const gridRef = useRef<any>(JSON.parse(localStorage.getItem("blocks") || '[]'));

  const rowref = useRef<number>();
  const colRef = useRef<number>();

  const rowHeader=useRef<number>();
  const colHeader=useRef<number>();


  const handleOpen = (key:any) => setOpen((prev) => ({ ...prev, [key]: true }));
  const handleClose = () => setOpen({ new: false, update: false });

  const handleGridCreate = () => {
    var newGrid=[]
      if (action==="create") {
        newGrid = Array.from({ length: rows }, () =>
          Array(columns).fill(null)
        );
  
        // Set column headers (even numbers)
        for (let i = 0; i < columns; i++) {
          newGrid[0][i] = {
            id:`A${i * 2}`,
            text:`A${i * 2}`
          }; // Even numbers for columns (A0, A2, A4, ...)
        }

        rowHeader.current=rows;
        colHeader.current=columns;
  
        // Set row headers (odd numbers)
        for (let i = 0; i < rows; i++) {
          newGrid[i][0] = {
            id:`B${i * 2 + 1}`,
            text:`B${i * 2 + 1}`
          }; // Odd numbers for rows (B1, B3, B5, ...)
        }
        rowref.current = rows;
        colRef.current = columns;
        gridRef.current = newGrid;
      } else if(action==="update") {
        newGrid = JSON.parse(JSON.stringify(grid));
        let addedRows = rows - (rowref.current||0);
        let addedColumns = columns - (colRef.current||0);

        console.log(addedRows+"-"+addedColumns)
        if (addedRows === 0 && addedColumns === 0) return;
        if (addedRows > 0) {
          for (let i = 0; i < addedRows; i++) {
            newGrid.push(new Array(newGrid[0].length).fill(null)); // Fill with 0 or any default value
            newGrid[(rowref.current||0) + i][0] = {
              id:`B${((rowHeader.current||0) + i) * 2 + 1}`,
              text:`B${((rowHeader.current||0) + i) * 2 + 1}`
            };
          }
        } else {
            for (let i = addedRows; i < 0; i++) {
              newGrid.pop();
            }
        }
  
        if (addedColumns > 0) {
          for (let i = 0; i < newGrid.length; i++) {
            for (let j = 0; j < addedColumns; j++) {
              newGrid[i].push(null); // Fill with 0 or any default value
              newGrid[0][(colRef.current||0) + j] = {
                id:`A${((colHeader.current||0) + j) * 2}`,
                text:`A${((colHeader.current||0) + j) * 2}`
              };
            }
          }
        }  else if (addedColumns < 0) {
            for (let i = 0; i < newGrid.length; i++) {
              for (let j = addedColumns; j < 0; j++) {
                newGrid[i].pop();
              }
            }
        }
        rowref.current = rows;
        colRef.current = columns;
        rowHeader.current=(rowHeader.current||0)+addedRows;
        colHeader.current=(colHeader.current||0)+addedColumns;
      }
  
  
      setGrid(newGrid);
      localStorage.setItem("blocks", JSON.stringify(newGrid));
      setAction(null);
  };

  useEffect(() => {
    let newGridBlocks:any = [];
    let oldGridBlocks:any = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (typeof grid[i][j] === "object" && grid[i][j] !== null) {
          const { id } = grid[i][j];

      // Check if the id does NOT start with "A" or "B"
      if (id && !(id.startsWith("A") || id.startsWith("B"))) {
          newGridBlocks.push(grid[i][j].id);
      }
        }
      }
    }
    for (let i = 0; i < gridRef.current.length; i++) {
      for (let j = 0; j < gridRef.current[i].length; j++) {
        if (
          typeof gridRef.current[i][j] === "object" &&
          gridRef.current[i][j] !== null
        ) {
          const {id}=gridRef.current[i][j];
          if(id && !(id.startsWith("A") || id.startsWith("B"))){
          oldGridBlocks.push(gridRef.current[i][j].id);
          }
        }
      }
    }

    const missedBlocks = oldGridBlocks.filter((each:any) => {
      if (!newGridBlocks.includes(each)) {
        return each;
      }
    });

    if (missedBlocks.length > 0) {
      for (let each of missedBlocks) {
        const newBlocks = { ...blocks };
        const blockId = each;
        newBlocks[blockId] = {
          id: blockId,
          text: `Block ${blockId.split("_")[1]}`,
        };
        setBlocks(newBlocks);
        addBlockToGrid(grid, each);
      }
    }
    gridRef.current = grid;
    localStorage.setItem("blocks", JSON.stringify(grid));
  }, [grid]);


  const addItem = (itemType: string) => {
    let counts=handleCount();

    const newGrid = [...grid];
    const blockCount =
      itemType === "item1"
        ? 1
        : itemType === "item2"
        ? 3
        : itemType === "item3"
        ? 4
        : [1, 2, 3];
    if(Array.isArray(blockCount)){
      counts+=3;
    }else{
      counts+=blockCount
    }
    
    if(counts>((rows-1)*(columns-1))){
      alert(`Can't add more blocks to the existing grid of ${rows-1}x${columns-1}`)
      return;
    }
    const newBlocks = { ...blocks };
    setItems((prev) => [...prev, itemType]);
    localStorage.setItem("items", JSON.stringify([...items, itemType]));

    if (itemType !== "item4"&&typeof blockCount==="number") {
      for (let i = 0; i < blockCount; i++) {
        const blockId = `i${itemType.slice(-1)}_${
          Object.keys(newBlocks).length + 1
        }`;
        newBlocks[blockId] = {
          id: blockId,
          text: `Block ${blockId.split("_")[1]}`,
        };
        addBlockToGrid(newGrid, blockId);
      }
    } else {
      let find:any = [];
      for (let i = 0; i < rows; i++) {
        var count = 0;
        for (let j = 0; j < columns; j++) {
          if (grid[i][j] === null) {
            ++count;
          } else {
            count = 0;
          }

          if (count === 3) {
            find = [i, j - 2];
            break;
          }
        }
        if (find.length > 0) {
          break;
        }
      }
      if(typeof blockCount!=="number"){
        for (let i = 0; i < blockCount.length; i++) {
          const blockId = `i${itemType.slice(-1)}_${
            Object.keys(newBlocks).length + 1
          }`;
          newBlocks[blockId] = {
            id: blockId,
            text: `Block ${blockId.split("_")[1]}`,
          };
          if (find.length === 0) {
            addBlockToGrid(newGrid, blockId);
          } else {
            grid[find[0]][find[1] + i] = { id: blockId, text: blockId };
            countRef.current++;
          }
      }
      
      }
    }
    localStorage.setItem("blocks", JSON.stringify(newGrid));
    setBlocks(newBlocks);
    gridRef.current = newGrid;
    setGrid(newGrid);
  };

  const addBlockToGrid = (grid: CellType[][], blockId: string) => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (grid[i][j] === null) {
          grid[i][j] = { id: blockId, text: blockId };
          countRef.current--;
          return;
        }
      }
    }
  };

  const moveBlock: MoveBlockFunction = (id, toRow, toCol) => {
    const newGrid = [...grid];
    const fromPos = getBlockPosition(id);

    // Prevent moving to the same position
    if (fromPos[0] === toRow && fromPos[1] === toCol) return;

    // Check if the target cell is already occupied
    if (newGrid[toRow][toCol] === null) {
      newGrid[toRow][toCol] = newGrid[fromPos[0]][fromPos[1]];
      newGrid[fromPos[0]][fromPos[1]] = null;
    } else {
      alert("Target cell is already occupied!");
    }
    localStorage.setItem("blocks", JSON.stringify(newGrid));
    setGrid(newGrid);
  };

  const getBlockPosition = (id: string): [number, number] => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (grid[i][j] && grid[i][j].id === id) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  };

  function handleCount(){
    const countBlocksArr=items.map(each=>{
      if(each==="item1"){
        return 1;
      }else if(each==="item2"){
        return 3;
      }else if(each==="item3"){
        return 4;
      }else if(each==="item4"){
        return 3;
      }
    })
    let count=0;
    for(let i=0;i<countBlocksArr.length;i++){
      count+=countBlocksArr[i]||0;
    }
    return count;
  }

  const handleReset = () => {
    setItems([]);
    setGrid([]);
    setBlocks({});
    gridRef.current = [];
    localStorage.setItem("blocks", JSON.stringify([]));
    localStorage.setItem("items", JSON.stringify([]));
    localStorage.setItem("count", JSON.stringify(0));
    localStorage.setItem("rows", JSON.stringify(0));
    localStorage.setItem("columns", JSON.stringify(0));
  };

  const handleForm = (e:any) => {
    e.preventDefault(); // Prevent default form submission behavior
    const data = new FormData(e.target);
    let rowChange = Number(data.get("rows"));
    let colChange = Number(data.get("columns"));

    if((rowChange===0||rowChange<0||!rowChange||colChange===0||colChange<0||!colChange)&&open.new){
      alert("Can't structure the grid with 0 or less than 1 row/column")
      return;
    }else if (open.new) {
      setRows(rowChange + 1); // +1 to account for header row
      setColumns(colChange + 1); // +1 to account for header column
      setAction("create")
    } else {
      
      // let r=0;
      // let c=0;

      // if(rowChange!==0){
      //   r=-1;
      // }

      // if(colChange!==0){
      //   c=-1;
      // }

      // console.log(rowChange+r);
      // console.log(colChange+c)

     // console.log(count+"-"+(rows+rowChange+r)*(columns+colChange+c))
     let count=handleCount();

      if(count>((rows+rowChange-1)*(columns+colChange-1))){
        alert("Can't reduce rows/columns to avoid lossing existing blocks")
        return;
      }else{
      setRows((prev) => prev + rowChange); // Increment current rows
      setColumns((prev) => prev + colChange); // Increment current columns
      setAction("update")
      }
    }
    handleClose(); // Close the dialog
  };
  
  useEffect(() => {
      if(action){
        handleGridCreate(); // Call the function to create or update the grid
      }
  }, [action]);

  console.log(rows+"/"+columns)

  console.log(rowref.current+"~"+colRef.current)


  const handleChange = (label: string, index: number) => {
    const newGrid = grid.map((row: any) => [...row]); // Create a deep copy of the grid
    const count=handleCount();

    if (label.startsWith("B")) {
      if (rows === 2) return;
  
      // Convert row to column
      if(count>((rows-2)*(columns))){
        alert("Can't convert rows-column as it will remove blocks")
        return;
      }else{
      const rowToAdd = newGrid[index]; // Select the row to convert
      newGrid.splice(index, 1); // Remove the row
  
      if (rowToAdd[0] && typeof rowToAdd[0].id === 'string') {
        rowToAdd[0].id = rowToAdd[0].id.replace("B", "A"); // Ensure rowToAdd[0].id is a string
      }
  
      // Determine the insert position for the new column
      let insertPosition = 1;
  
      for (let i = 0; i < newGrid[0].length; i++) {
        const currentId = newGrid[0][i]?.id;
        if (typeof currentId === 'string') {
          const currentValue = Number(currentId.replace("A", ""));
          const newValue = Number(rowToAdd[0].id.replace("A", ""));
  
          if (newValue > currentValue && (i === newGrid[0].length - 1 || newValue < Number(newGrid[0][i + 1]?.id?.replace("A", "")))) {
            insertPosition = i + 1; // Set insert position
            break;
          }
        }
      }
  
      // Add the row as a new column
      for (let i = 0; i < newGrid.length; i++) {
        newGrid[i].splice(insertPosition, 0, rowToAdd[i] !== undefined ? rowToAdd[i] : null);
      }
  
      // Update grid and dimensions
      rowref.current=rows-1;
      colRef.current=columns+1;
      localStorage.setItem("blocks", JSON.stringify(newGrid));
      setGrid(newGrid);
      setRows(rows - 1);
      setColumns(columns + 1);
      localStorage.setItem("rows", JSON.stringify(rows-1));
      localStorage.setItem("columns", JSON.stringify(columns+1));
    }
    } else if (label.startsWith("A")) {
      if (columns === 2) return;
  
      // Convert column to row
      if(count>((rows)*(columns-2))){
        alert("Can't convert column-row as it will remove blocks")
        return;
      }else{
      const colToAdd = newGrid.map((row: any) => row[index]); // Extract the column to add
      newGrid.forEach((row: any) => row.splice(index, 1)); // Remove the column
  
      if (colToAdd[0] && typeof colToAdd[0].id === 'string') {
        colToAdd[0].id = colToAdd[0].id.replace("A", "B"); // Ensure colToAdd[0].id is a string
      }
  
      // Determine the insert position for the new row
      let insertPosition = 0;
  
      for (let i = 0; i < newGrid.length; i++) {
        const currentId = newGrid[i][0]?.id;
        if (typeof currentId === 'string') {
          const currentValue = Number(currentId.replace("B", ""));
          const newValue = Number(colToAdd[0].id.replace("B", ""));
  
          if (newValue > currentValue && (i === newGrid.length - 1 || newValue < Number(newGrid[i + 1][0]?.id?.replace("B", "")))) {
            insertPosition = i + 1; // Set insert position
            break;
          }
        }
      }
  
      // Create a new row with the correct number of columns
      const newRow = Array(columns - 1).fill(null); // Create new row filled with nulls
      for (let i = 0; i < colToAdd.length; i++) {
        if (i < newRow.length) {
          newRow[i] = colToAdd[i]; // Fill the new row with column values
        }
      }
  
      // Insert the new row at the determined position
      newGrid.splice(insertPosition, 0, newRow); // Add the new row to the grid
  
      // Update grid dimensions
      rowref.current=rows+1;
      colRef.current=columns-1;
      localStorage.setItem("blocks", JSON.stringify(newGrid));
      setGrid(newGrid);
      setRows(rows + 1);
      setColumns(columns - 1);
      localStorage.setItem("rows", JSON.stringify(rows+1));
      localStorage.setItem("columns", JSON.stringify(columns-1));
    }
    }
  };

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

        <Dialog open={open.new || open.update} onClose={handleClose}>
         <form onSubmit={(e:any)=>handleForm(e)}>
          <DialogTitle>{open.new ? "Create Grid" : "Update Grid"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={open.new ? "Rows" : "Increase / Decrease rows by "}
              type="number"
              fullWidth
              variant="outlined"
              name="rows"
            />
            <TextField
              margin="dense"
              label={open.new ? "Columns" : "Increase / Decrease columns by "}
              type="number"
              fullWidth
              variant="outlined"
              name="columns"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit"
            >
              {open.new ? "Create" : "Update"}
            </Button>
          </DialogActions>
          </form>
        </Dialog>

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
              sx={{margin:"0px 20px"}}
            >
              Add Item 1<br/>
              (1 Block)
            </Button>
            <Button
              onClick={() => addItem("item2")}
              disabled={items.includes("item2")}
              variant="contained"
              sx={{margin:"0px 20px"}}
            >
              Add Item 2<br/>
              (3 Blocks)
            </Button>
            <Button
              onClick={() => addItem("item3")}
              disabled={items.includes("item3")}
              variant="contained"
              sx={{margin:"0px 20px"}}
            >
              Add Item 3<br/>
              (4 Blocks)
            </Button>
            <Button
              onClick={() => addItem("item4")}
              disabled={items.includes("item4")}
              variant="contained"
              sx={{margin:"0px 20px"}}
            >
              Add Item 4<br/>
              (Group of 3 Blocks)
            </Button>
          </div>


            {grid.map((row:any, rowIndex:number) => (
              <Grid item xs={12} key={rowIndex}>
                <Grid container justifyContent="center">
                  {row.map((cell:any, colIndex:number) => {
                    if (colIndex === 0 && rowIndex === 0) {
                      return (
                        <div key={colIndex} style={{ border: "1px solid grey", color: "black", width: "57px" }}>
                          {" "}
                        </div>
                      );
                    }else if (colIndex === 0) {
                      return (
                        <Button
                          key={colIndex}
                          variant="outlined"
                          sx={{ border: "1px solid grey", color: "black" }}
                          onClick={() => handleChange(cell.id, rowIndex)} // Note: Adjusted for any errors in typing
                        >
                          {cell ? cell.id : ''} {/* Display the text property if the cell is not null */}
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
                          {cell ? cell.id : ''} {/* Display the text property if the cell is not null */}
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
    </DndProvider>
  );
};

export default App;
