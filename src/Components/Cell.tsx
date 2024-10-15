import React from "react";
import Block from "./Block";
import { useDrop } from "react-dnd";

const ItemType = "BLOCK";

export interface CellType {
  id: string;
  text: string;
}

export type MoveBlockFunction = (id: string, rowIndex: number, colIndex: number) => void;

interface CellProps {
  rowIndex: number;
  colIndex: number;
  cell: CellType | null; // cell can be null if it's empty
  moveBlock: MoveBlockFunction;
}

const Cell: React.FC<CellProps> = React.memo(({ rowIndex, colIndex, cell, moveBlock }) => {
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
});

export default Cell;