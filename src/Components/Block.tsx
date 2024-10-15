import {
    Paper,
  } from "@mui/material";
  import { useDrag } from "react-dnd";

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

export default Block;