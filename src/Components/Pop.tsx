import React, {
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CellType, MoveBlockFunction } from "./Cell";

import addLocalStorage from "./LocalStorage";
import DisplayGrid from "./DisplayGrid";

const GridLazy=lazy(()=>import("./DisplayGrid"))

const App: React.FC = () => {
  const [open, setOpen] = useState({
    new: false,
    update: false,
  });
  const [grid, setGrid] = useState<any>(
    JSON.parse(localStorage.getItem("blocks") || "[]")
  );
  const [rows, setRows] = useState<number>(
    Number(localStorage.getItem("rows")) || 0
  );
  const [columns, setColumns] = useState<number>(
    Number(localStorage.getItem("columns")) || 0
  );
  const [blocks, setBlocks] = useState<{ [key: string]: CellType }>({});
  const [items, setItems] = useState<string[]>(
    JSON.parse(localStorage.getItem("items") || "[]")
  );
  const [action, setAction] = useState<string | null>(null);

  const gridRef = useRef<any>(
    JSON.parse(localStorage.getItem("blocks") || "[]")
  );

  const rowref = useRef<number>();
  const colRef = useRef<number>();

  const rowHeader = useRef<number>();
  const colHeader = useRef<number>();

  const handleOpen = (key: any) =>
    setOpen((prev) => ({ ...prev, [key]: true }));
  const handleClose = () => setOpen({ new: false, update: false });

  const handleGridCreate = useCallback(() => {
    var newGrid = [];
    newGrid = Array.from({ length: rows }, () => Array(columns).fill(null));

    // Set column headers (even numbers)
    for (let i = 0; i < columns; i++) {
      newGrid[0][i] = {
        id: `A${i * 2}`,
        text: `A${i * 2}`,
      }; // Even numbers for columns (A0, A2, A4, ...)
    }


    // Set row headers (odd numbers)
    for (let i = 0; i < rows; i++) {
      newGrid[i][0] = {
        id: `B${i * 2 + 1}`,
        text: `B${i * 2 + 1}`,
      }; // Odd numbers for rows (B1, B3, B5, ...)
      rowref.current = rows;
      colRef.current = columns;
      gridRef.current = newGrid;
      rowHeader.current = rows;
      colHeader.current = columns;
      setGrid(newGrid);
      addLocalStorage("blocks", newGrid);
      setAction(null);
    }
  },[rows,columns]);


  const handleUpdateGrid=useCallback(()=> {
    let newGrid = JSON.parse(JSON.stringify(grid));
    let addedRows = rows - (rowref.current || 0);
    let addedColumns = columns - (colRef.current || 0);

    console.log(addedRows + "-" + addedColumns);
    if (addedRows === 0 && addedColumns === 0) return;
    if (addedRows > 0) {
      for (let i = 0; i < addedRows; i++) {
        newGrid.push(new Array(newGrid[0].length).fill(null)); // Fill with 0 or any default value
        newGrid[(rowref.current || 0) + i][0] = {
          id: `B${((rowHeader.current || 0) + i) * 2 + 1}`,
          text: `B${((rowHeader.current || 0) + i) * 2 + 1}`,
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
          newGrid[0][(colRef.current || 0) + j] = {
            id: `A${((colHeader.current || 0) + j) * 2}`,
            text: `A${((colHeader.current || 0) + j) * 2}`,
          };
        }
      }
    } else if (addedColumns < 0) {
      for (let i = 0; i < newGrid.length; i++) {
        for (let j = addedColumns; j < 0; j++) {
          newGrid[i].pop();
        }
      }
    }
    rowref.current = rows;
    colRef.current = columns;
    rowHeader.current = (rowHeader.current || 0) + addedRows;
    colHeader.current = (colHeader.current || 0) + addedColumns;
    setGrid(newGrid);
    addLocalStorage("blocks", newGrid);
    setAction(null);
  },[rows,columns]);

  useEffect(() => {
    let newGridBlocks: any = [];
    let oldGridBlocks: any = [];
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
          const { id } = gridRef.current[i][j];
          if (id && !(id.startsWith("A") || id.startsWith("B"))) {
            oldGridBlocks.push(gridRef.current[i][j].id);
          }
        }
      }
    }

    const missedBlocks = oldGridBlocks.filter((each: any) => {
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
    addLocalStorage("blocks", grid);
  }, [grid]);

    //for 3 consecutive spaces
    const findSpaces=useCallback(()=>{
      let find: any = [];
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
      return find;
    },[items])

  const addItem = (itemType: string) => {
    let counts = handleCount;

    const newGrid = [...grid];
    const blockCount =
      itemType === "item1"
        ? 1
        : itemType === "item2"
        ? 3
        : itemType === "item3"
        ? 4
        : itemType==="item4"?3:0;
    if (Array.isArray(blockCount)) {
      counts += 3;
    } else {
      counts += blockCount;
    }

    //error when new item can't fit
    if (counts > (rows - 1) * (columns - 1)) {
      alert(
        `Can't add more blocks to the existing grid of ${rows - 1}x${
          columns - 1
        }`
      );
      return;
    }
    const newBlocks = { ...blocks };
    let find: any = findSpaces();
    for (let i = 0; i < blockCount; i++) {
      const blockId = `i${itemType.slice(-1)}_${
        Object.keys(newBlocks).length + 1
      }`;
      newBlocks[blockId] = {
        id: blockId,
        text: `Block ${blockId.split("_")[1]}`,
      };
      if(itemType==="item4"&&find.length>0){
        grid[find[0]][find[1] + i] = { id: blockId, text: blockId };
      }else{
      addBlockToGrid(newGrid, blockId);
      }
    }
    setItems((prev) => [...prev, itemType]);
    addLocalStorage("items", [...items, itemType]);
    addLocalStorage("blocks", newGrid);
    setBlocks(newBlocks);
    gridRef.current = newGrid;
    setGrid(newGrid);
  };



  const addBlockToGrid = (grid: CellType[][], blockId: string) => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (grid[i][j] === null) {
          grid[i][j] = { id: blockId, text: blockId };
          return;
        }
      }
    }
  };

  const moveBlock: MoveBlockFunction = useCallback(
    (id, toRow, toCol) => {
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
      addLocalStorage("blocks", newGrid);
      setGrid(newGrid);
    },
    [grid]
  );

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

  const handleCount = useMemo(() => {
    return items.reduce((count, each) => {
      if (each === "item1") return count + 1;
      if (each === "item2") return count + 3;
      if (each === "item3") return count + 4;
      if (each === "item4") return count + 3;
      return count;
    }, 0);
  }, [items, grid]);

  const handleReset = () => {
    setItems([]);
    setGrid([]);
    setBlocks({});
    gridRef.current = [];
    addLocalStorage("blocks", []);
    addLocalStorage("items", []);
    addLocalStorage("count", 0);
    addLocalStorage("rows", 0);
    addLocalStorage("columns", 0);
  };

  const handleForm = (e: any) => {
    e.preventDefault(); // Prevent default form submission behavior
    const data = new FormData(e.target);
    let rowChange = Number(data.get("rows"));
    let colChange = Number(data.get("columns"));

    if (
      (rowChange === 0 ||
        rowChange < 0 ||
        !rowChange ||
        colChange === 0 ||
        colChange < 0 ||
        !colChange) &&
      open.new
    ) {
      alert("Can't structure the grid with 0 or less than 1 row/column");
      return;
    } else if (open.new) {
      setRows(rowChange + 1); // +1 to account for header row
      setColumns(colChange + 1); // +1 to account for header column
      setAction("create");
    } else {
      let count = handleCount;

      if (count > (rows + rowChange - 1) * (columns + colChange - 1)) {
        alert("Can't reduce rows/columns to avoid lossing existing blocks");
        return;
      } else {
        setRows((prev) => prev + rowChange); // Increment current rows
        setColumns((prev) => prev + colChange); // Increment current columns
        setAction("update");
      }
    }
    handleClose(); // Close the dialog
  };

  useEffect(() => {
    if (action === "create") {
      handleGridCreate(); // Call the function to create or update the grid
    } else if (action === "update") {
      handleUpdateGrid();
    }
  }, [action]);

  const handleChange = (label: string, index: number) => {
    const newGrid = grid.map((row: any) => [...row]); // Create a deep copy of the grid
    const count = handleCount;

    if (label.startsWith("B")) {
      if (rows === 2) return;

      // Convert row to column
      if (count > (rows - 2) * columns) {
        alert("Can't convert rows-column as it will remove blocks");
        return;
      } else {
        const rowToAdd = newGrid[index]; // Select the row to convert
        newGrid.splice(index, 1); // Remove the row

        if (rowToAdd[0] && typeof rowToAdd[0].id === "string") {
          rowToAdd[0].id = rowToAdd[0].id.replace("B", "A"); // Ensure rowToAdd[0].id is a string
        }

        // Determine the insert position for the new column
        let insertPosition = 1;

        for (let i = 0; i < newGrid[0].length; i++) {
          const currentId = newGrid[0][i]?.id;
          if (typeof currentId === "string") {
            const currentValue = Number(currentId.replace("A", ""));
            const newValue = Number(rowToAdd[0].id.replace("A", ""));

            if (
              newValue > currentValue &&
              (i === newGrid[0].length - 1 ||
                newValue < Number(newGrid[0][i + 1]?.id?.replace("A", "")))
            ) {
              insertPosition = i + 1; // Set insert position
              break;
            }
          }
        }

        // Add the row as a new column
        for (let i = 0; i < newGrid.length; i++) {
          newGrid[i].splice(
            insertPosition,
            0,
            rowToAdd[i] !== undefined ? rowToAdd[i] : null
          );
        }

        // Update grid and dimensions
        rowref.current = rows - 1;
        colRef.current = columns + 1;
        setRows(rows - 1);
        setColumns(columns + 1);
        addLocalStorage("rows", rows - 1);
        addLocalStorage("columns", columns + 1);
      }
    } else if (label.startsWith("A")) {
      if (columns === 2) return;

      // Convert column to row
      if (count > rows * (columns - 2)) {
        alert("Can't convert column-row as it will remove blocks");
        return;
      } else {
        const colToAdd = newGrid.map((row: any) => row[index]); // Extract the column to add
        newGrid.forEach((row: any) => row.splice(index, 1)); // Remove the column

        if (colToAdd[0] && typeof colToAdd[0].id === "string") {
          colToAdd[0].id = colToAdd[0].id.replace("A", "B"); // Ensure colToAdd[0].id is a string
        }

        // Determine the insert position for the new row
        let insertPosition = 0;

        for (let i = 0; i < newGrid.length; i++) {
          const currentId = newGrid[i][0]?.id;
          if (typeof currentId === "string") {
            const currentValue = Number(currentId.replace("B", ""));
            const newValue = Number(colToAdd[0].id.replace("B", ""));

            if (
              newValue > currentValue &&
              (i === newGrid.length - 1 ||
                newValue < Number(newGrid[i + 1][0]?.id?.replace("B", "")))
            ) {
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
        rowref.current = rows + 1;
        colRef.current = columns - 1;
        setRows(rows + 1);
        setColumns(columns - 1);
        addLocalStorage("rows", rows + 1);
        addLocalStorage("columns", columns - 1);
      }
    }
    setGrid(newGrid);
    addLocalStorage("blocks", newGrid);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DisplayGrid
        handleOpen={handleOpen}
        handleChange={handleChange}
        handleForm={handleForm}
        handleReset={handleReset}
        handleClose={handleClose}
        moveBlock={moveBlock}
        addItem={addItem}
        items={items}
        grid={grid}
        open={open}
      />
    </DndProvider>
  );
};

export default App;
