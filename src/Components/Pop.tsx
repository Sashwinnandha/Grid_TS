import React, { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CellType, MoveBlockFunction } from "./Cell";

import addLocalStorage from "./LocalStorage";
import DisplayGrid from "./DisplayGrid";

const App: React.FC = () => {
  const [open, setOpen] = useState({
    new: false,
    update: false,
  });

  const [inputData, setInputData] = useState({
    rows: Number(localStorage.getItem("rows")) || 0,
    columns: Number(localStorage.getItem("columns")) || 0,
  });

  const [action, setAction] = useState<string | null>(null);
  const [gridVersion, setGridVersion] = useState<number>(0);

  const gridRef = useRef<any>(JSON.parse(localStorage.getItem("grid") || "[]"));

  const blockRef = useRef<{ [key: string]: CellType }>(
    JSON.parse(localStorage.getItem("blocks") || "{}")
  );

  const rowref = useRef<number>(Number(localStorage.getItem("rows")) || 0);
  const colRef = useRef<number>(Number(localStorage.getItem("columns")) || 0);

  const rowHeader = useRef<number>(
    Number(localStorage.getItem("rowHeader")) || 0
  );
  const colHeader = useRef<number>(
    Number(localStorage.getItem("colHeader")) || 0
  );

  const missingBlocks = useRef<any>([]);
 
  useEffect(() => {
    if (missingBlocks.current.length > 0) {
      for (let each of missingBlocks.current) {
        const newBlocks: any = { ...blockRef.current };
        const blockId = each.id;
        newBlocks[blockId] = {
          id: blockId,
          text: `Block ${blockId.split("_")[1]}`,
        };
        blockRef.current = newBlocks;
        setGridVersion((prev) => prev + 1);
        addBlockToGrid(gridRef.current, each.id);
      }
    }
    addLocalStorage("grid", gridRef.current);
    addLocalStorage("blocks", blockRef.current);
    missingBlocks.current = [];
  }, [missingBlocks.current, blockRef.current]);

  useEffect(() => {
    if (action === "create") {
      handleGridCreate(); // Call the function to create or update the grid
    } else if (action === "update") {
      handleUpdateGrid();
    }
  }, [action]);

  //functions

  const handleOpen = (key: any) =>
    setOpen((prev) => ({ ...prev, [key]: true }));

  const handleClose = () => setOpen({ new: false, update: false });

  const handleGridCreate = useCallback(() => {
    gridRef.current = Array.from({ length: inputData.rows }, () =>
      Array(inputData.columns).fill(null)
    );

    // Set column headers (even numbers)
    for (let i = 0; i < inputData.columns; i++) {
      gridRef.current[0][i] = {
        id: `A${i * 2}`,
        text: `A${i * 2}`,
      }; // Even numbers for columns (A0, A2, A4, ...)
    }

    // Set row headers (odd numbers)
    for (let i = 0; i < inputData.rows; i++) {
      gridRef.current[i][0] = {
        id: `B${i * 2 + 1}`,
        text: `B${i * 2 + 1}`,
      }; // Odd numbers for rows (B1, B3, B5, ...)
      rowref.current = inputData.rows;
      colRef.current = inputData.columns;
      rowHeader.current = inputData.rows;
      colHeader.current = inputData.columns;
      addLocalStorage("rowHeader", rowHeader.current);
      addLocalStorage("colHeader", colHeader.current);
      addLocalStorage("grid", gridRef.current);
      setAction(null);
      setGridVersion((prev) => prev + 1);
    }
  }, [inputData.rows, inputData.columns]);

  const handleUpdateGrid = useCallback(() => {
    let addedRows = inputData.rows - (rowref.current || 0);
    let addedColumns = inputData.columns - (colRef.current || 0);

    if (addedRows === 0 && addedColumns === 0) return;
    if (addedRows > 0) {
      for (let i = 0; i < addedRows; i++) {
        gridRef.current.push(new Array(gridRef.current[0].length).fill(null)); // Fill with 0 or any default value
        gridRef.current[(rowref.current || 0) + i][0] = {
          id: `B${((rowHeader.current || 0) + i) * 2 + 1}`,
          text: `B${((rowHeader.current || 0) + i) * 2 + 1}`,
        };
      }
    } else if (addedRows < 0) {
      const lastRowElements = gridRef.current[gridRef.current.length - 1];

      for (let each of lastRowElements) {
        addMissingBlocks(each);
      }
      for (let i = addedRows; i < 0; i++) {
        gridRef.current.pop();
      }
    }

    if (addedColumns > 0) {
      for (let i = 0; i < gridRef.current.length; i++) {
        for (let j = 0; j < addedColumns; j++) {
          gridRef.current[i].push(null); // Fill with 0 or any default value
          gridRef.current[0][(colRef.current || 0) + j] = {
            id: `A${((colHeader.current || 0) + j) * 2}`,
            text: `A${((colHeader.current || 0) + j) * 2}`,
          };
        }
      }
    } else if (addedColumns < 0) {
      const lastColumnElements = gridRef.current.map(
        (row: any) => row[row.length - 1]
      );
      for (let each of lastColumnElements) {
        addMissingBlocks(each);
      }
      for (let i = 0; i < gridRef.current.length; i++) {
        for (let j = addedColumns; j < 0; j++) {
          gridRef.current[i].pop();
        }
      }
    }
    rowref.current = inputData.rows;
    colRef.current = inputData.columns;
    rowHeader.current = (rowHeader.current || 0) + addedRows;
    colHeader.current = (colHeader.current || 0) + addedColumns;
    addLocalStorage("rowHeader", rowHeader.current);
    addLocalStorage("colHeader", colHeader.current);
    addLocalStorage("grid", gridRef.current);
    setAction(null);
    setGridVersion((prev) => prev + 1);
  }, [inputData.rows, inputData.columns]);


  //for 3 consecutive spaces
  const findSpaces = useCallback(() => {
    let find: any = [];
    for (let i = 0; i < inputData.rows; i++) {
      var count = 0;
      for (let j = 0; j < inputData.columns; j++) {
        if (gridRef.current[i][j] === null) {
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
  }, [blockRef.current]);

  const addItem = (itemType: string, add: number) => {
    let counts = Object.keys(blockRef.current).length + 1;
    counts += add;

    //error when new item can't fit
    if (counts > (inputData.rows - 1) * (inputData.columns - 1)) {
      alert(
        `Can't add more blocks to the existing grid of ${inputData.rows - 1}x${
          inputData.columns - 1
        }`
      );
      return;
    }
    const newBlocks: any = { ...blockRef.current };
    let find: any = findSpaces();
    for (let i = 0; i < add; i++) {
      const blockId = `i${itemType.slice(-1)}_${
        Object.keys(newBlocks).length + 1
      }`;
      newBlocks[blockId] = {
        id: blockId,
        text: `Block ${blockId.split("_")[1]}`,
      };
      if (itemType === "item4" && find.length > 0) {
        gridRef.current[find[0]][find[1] + i] = { id: blockId, text: blockId };
      } else {
        addBlockToGrid(gridRef.current, blockId);
      }
    }
    addLocalStorage("grid", gridRef.current);
    addLocalStorage("blocks", blockRef.current);
    blockRef.current = newBlocks;
    setGridVersion((prev) => prev + 1);
  };

  const addBlockToGrid = (grid: CellType[][], blockId: string) => {
    for (let i = 0; i < inputData.rows; i++) {
      for (let j = 0; j < inputData.columns; j++) {
        if (grid[i][j] === null) {
          grid[i][j] = { id: blockId, text: blockId };
          return;
        }
      }
    }
  };

  const moveBlock: MoveBlockFunction = (id, toRow, toCol) => {
    const fromPos = getBlockPosition(id);

    // Prevent moving to the same position
    if (fromPos[0] === toRow && fromPos[1] === toCol) return;

    // Check if the target cell is already occupied
    if (gridRef.current[toRow][toCol] === null) {
      gridRef.current[toRow][toCol] = gridRef.current[fromPos[0]][fromPos[1]];
      gridRef.current[fromPos[0]][fromPos[1]] = null;
    } else {
      alert("Target cell is already occupied!");
    }
    addLocalStorage("grid", gridRef.current);
    setGridVersion((prev) => prev + 1);
  };

  const getBlockPosition = (id: string): [number, number] => {
    for (let i = 0; i < inputData.rows; i++) {
      for (let j = 0; j < inputData.columns; j++) {
        if (gridRef.current[i][j] && gridRef.current[i][j].id === id) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
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
      setInputData((prev) => ({
        ...prev,
        rows: rowChange + 1,
        columns: colChange + 1,
      }));
      setAction("create");
      addLocalStorage("rows", rowChange + 1);
      addLocalStorage("columns", colChange + 1);
    } else {
      let count = Object.keys(blockRef.current).length;

      if (
        count >
        (inputData.rows + rowChange - 1) * (inputData.columns + colChange - 1)
      ) {
        alert("Can't reduce rows/columns to avoid lossing existing blocks");
        return;
      } else {
        setInputData((prev) => ({
          ...prev,
          rows: prev.rows + rowChange,
          columns: prev.columns + colChange,
        })); // Increment current rows
        setAction("update");
        addLocalStorage("rows", inputData.rows + rowChange);
        addLocalStorage("columns", inputData.columns + colChange);
      }
    }
    handleClose(); // Close the dialog
  };

  const handleReset = () => {
    blockRef.current = {};
    gridRef.current = [];
    setGridVersion(0);
    addLocalStorage("grid", []);
    addLocalStorage("block", {});
    addLocalStorage("items", []);
    addLocalStorage("rows", 0);
    addLocalStorage("columns", 0);
    addLocalStorage("rowHeader", 0);
    addLocalStorage("colHeader", 0);
  };

  function addMissingBlocks(box: CellType) {
    if (typeof box === "object" && box !== null) {
      const { id } = box;

      // Check if the id does NOT start with "A" or "B"
      if (id && !(id.startsWith("A") || id.startsWith("B"))) {
        missingBlocks.current.push(box);
      }
    }
  }


  const handleChange = (label: string, index: number) => {
    const count = Object.keys(blockRef.current).length;

    if (label.startsWith("B")) {
      if (inputData.rows === 2) return;

      // Convert row to column
      if (count > (inputData.rows - 2) * inputData.columns) {
        alert("Can't convert rows-column as it will remove blocks");
        return;
      } else {
        const rowToAdd = gridRef.current[index]; // Select the row to convert
        gridRef.current.splice(index, 1); // Remove the row

        if (rowToAdd[0] && typeof rowToAdd[0].id === "string") {
          rowToAdd[0].id = rowToAdd[0].id.replace("B", "A"); // Ensure rowToAdd[0].id is a string
        }

        // Determine the insert position for the new column
        let insertPosition = 1;

        for (let i = 0; i < gridRef.current[0].length; i++) {
          const currentId = gridRef.current[0][i]?.id;
          if (typeof currentId === "string") {
            const currentValue = Number(currentId.replace("A", ""));
            const newValue = Number(rowToAdd[0].id.replace("A", ""));

            if (
              newValue > currentValue &&
              (i === gridRef.current[0].length - 1 ||
                newValue <
                  Number(gridRef.current[0][i + 1]?.id?.replace("A", "")))
            ) {
              insertPosition = i + 1; // Set insert position
              break;
            }
          }
        }

        // Add the row as a new column
        for (let i = 0; i < gridRef.current.length; i++) {
          gridRef.current[i].splice(
            insertPosition,
            0,
            rowToAdd[i] !== undefined ? rowToAdd[i] : null
          );
        }

        if (inputData.rows - 1 < rowToAdd.length) {
          for (let i = 0; i < rowToAdd.length - (inputData.rows - 1); i++) {
            if (rowToAdd[rowToAdd.length - (i + 1)] !== null) {
              addMissingBlocks(rowToAdd[rowToAdd.length - (1 + i)]);
            }
          }
        }

        // Update grid and dimensions
        rowref.current = inputData.rows - 1;
        colRef.current = inputData.columns + 1;
        setInputData((prev) => ({
          ...prev,
          rows: prev.rows - 1,
          columns: prev.columns + 1,
        }));
        addLocalStorage("rows", inputData.rows - 1);
        addLocalStorage("columns", inputData.columns + 1);
      }
    } else if (label.startsWith("A")) {
      if (inputData.columns === 2) return;

      // Convert column to row
      if (count > inputData.rows * (inputData.columns - 2)) {
        alert("Can't convert column-row as it will remove blocks");
        return;
      } else {
        const colToAdd = gridRef.current.map((row: any) => row[index]); // Extract the column to add
        gridRef.current.forEach((row: any) => row.splice(index, 1)); // Remove the column

        if (colToAdd[0] && typeof colToAdd[0].id === "string") {
          colToAdd[0].id = colToAdd[0].id.replace("A", "B"); // Ensure colToAdd[0].id is a string
        }

        // Determine the insert position for the new row
        let insertPosition = 0;

        for (let i = 0; i < gridRef.current.length; i++) {
          const currentId = gridRef.current[i][0]?.id;
          if (typeof currentId === "string") {
            const currentValue = Number(currentId.replace("B", ""));
            const newValue = Number(colToAdd[0].id.replace("B", ""));

            if (
              newValue > currentValue &&
              (i === gridRef.current.length - 1 ||
                newValue <
                  Number(gridRef.current[i + 1][0]?.id?.replace("B", "")))
            ) {
              insertPosition = i + 1; // Set insert position
              break;
            }
          }
        }

        // Create a new row with the correct number of columns
        const newRow = Array(inputData.columns - 1).fill(null); // Create new row filled with nulls
        for (let i = 0; i < colToAdd.length; i++) {
          if (i < newRow.length) {
            newRow[i] = colToAdd[i]; // Fill the new row with column values
          } else {
            addMissingBlocks(colToAdd[i]);
          }
        }

        // Insert the new row at the determined position
        gridRef.current.splice(insertPosition, 0, newRow); // Add the new row to the grid

        // Update grid dimensions
        rowref.current = inputData.rows + 1;
        colRef.current = inputData.columns - 1;
        setInputData((prev) => ({
          ...prev,
          rows: prev.rows + 1,
          columns: prev.columns - 1,
        }));
        addLocalStorage("rows", inputData.rows + 1);
        addLocalStorage("columns", inputData.columns - 1);
      }
    }
    setGridVersion((prev) => prev + 1);
    addLocalStorage("grid", gridRef.current);
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
        items={blockRef.current}
        grid={gridRef.current}
        open={open}
      />
    </DndProvider>
  );
};

export default App;
