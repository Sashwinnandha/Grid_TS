import React, { useRef, useState } from "react";
import { Stage, Layer, Circle as KonvaCircle, Rect, Star as KonvaStar, Line as KonvaLine } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import SquareOutlinedIcon from "@mui/icons-material/SquareOutlined";
import ChangeHistoryOutlinedIcon from "@mui/icons-material/ChangeHistoryOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import GestureIcon from "@mui/icons-material/Gesture";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import Button from "@mui/material/Button";

interface Circle {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
}

interface Square {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color: string;
}

interface Star {
  id: string;
  x: number;
  y: number;
  color: string;
  innerRadius: number;
  outerRadius: number;
}

interface Line {
  id: string;
  x: number;
  y: number;
  color: string;
  points: number[];
}

interface Triangle {
  id: string;
  x: number;
  y: number;
  color: string;
  points: number[];
}

interface Shapes {
  circle: Circle[];
  square: Square[];
  star: Star[];
  line: Line[];
  triangle: Triangle[];
}

const initialCircle: Circle[] = JSON.parse(localStorage.getItem("circle") || "[]");
const initialSquare: Square[] = JSON.parse(localStorage.getItem("square") || "[]");
const initialStar: Star[] = JSON.parse(localStorage.getItem("star") || "[]");
const initialLine: Line[] = JSON.parse(localStorage.getItem("line") || "[]");
const initialTriangle: Triangle[] = JSON.parse(localStorage.getItem("triangle") || "[]");

const DrawShapes: React.FC = () => {
  const [shape, setShape] = useState<string>(""); // Current shape type
  const [color, setColor] = useState<string>("black"); // Current drawing color
  const [shapes, setShapes] = useState<Shapes>({
    circle: initialCircle,
    square: initialSquare,
    star: initialStar,
    line: initialLine,
    triangle: initialTriangle,
  });

  const paintRef = useRef<boolean>(false);
  const stageRef = useRef<any>(null);
  const currentShapeRef = useRef<string | null>(null);

  const calculateTrianglePoints = (x1: number, y1: number, x2: number, y2: number): number[] => {
    const baseWidth = x2 - x1;
    const height = y2 - y1;
    return [
      x1, y1, // Vertex A
      x2, y1, // Vertex B
      x1 + baseWidth / 2, y1 - height // Vertex C
    ];
  };

  const createShape = (shapeType: string, x: number, y: number, id: string) => {
    const newShape = { id, x, y, color };
    switch (shapeType) {
      case "circle":
        return { ...newShape, radius: 1 };
      case "square":
        return { ...newShape, width: 5, height: 5 };
      case "star":
        return { ...newShape, innerRadius: 2, outerRadius: 4 };
      case "triangle":
        return { ...newShape, points: calculateTrianglePoints(x, y, x, y) };
      case "line":
        return { ...newShape, points: [x, y] };
      default:
        return null;
    }
  };

  const updateShapes = (shapeType: keyof Shapes, updatedShapes: any[]) => {
    setShapes(prevShapes => {
      const newShapes = { ...prevShapes, [shapeType]: updatedShapes };
      localStorage.setItem(shapeType, JSON.stringify(updatedShapes));
      return newShapes;
    });
  };

  const handleMouseDown = () => {
    paintRef.current = true;
    const { x, y } = stageRef.current.getPointerPosition();
    const id = uuidv4();
    currentShapeRef.current = id;

    const newShape = createShape(shape, x, y, id);
    if (newShape) {
      updateShapes(shape as keyof Shapes, [...shapes[shape as keyof Shapes] || [], newShape]);
    }
  };

  const handleMouseMove = () => {
    if (!paintRef.current || !currentShapeRef.current) return;
    const id = currentShapeRef.current;
    const { x, y } = stageRef.current.getPointerPosition();

    const shapeType = shape as keyof Shapes;
    const currentShapes = shapes[shapeType] || [];

    const updatedShapes = currentShapes.map((shapeItem: any) =>
      shapeItem.id === id
        ? {
            ...shapeItem,
            ...(shape === "circle" && { radius: Math.sqrt((x - shapeItem.x) ** 2 + (y - shapeItem.y) ** 2) }),
            ...(shape === "square" && { width: x - shapeItem.x, height: y - shapeItem.y }),
            ...(shape === "star" && {
              innerRadius: Math.sqrt((x - shapeItem.x) ** 2 + (y - shapeItem.y) ** 2) / 3,
              outerRadius: Math.sqrt((x - shapeItem.x) ** 2 + (y - shapeItem.y) ** 2)
            }),
            ...(shape === "triangle" && { points: calculateTrianglePoints(shapeItem.x, shapeItem.y, x, y) }),
            ...(shape === "line" && { points: [...shapeItem.points, x, y] })
          }
        : shapeItem
    );

    updateShapes(shapeType, updatedShapes);
  };

  const handleMouseUp = () => {
    paintRef.current = false;
    currentShapeRef.current = null;
  };

  const handleReset = () => {
    setShapes({
      circle: [],
      square: [],
      star: [],
      line: [],
      triangle: []
    });
    localStorage.clear();
  };

  const handleDownload = () => {
    const url = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragEnd = (e: any, shapeType: keyof Shapes) => {
    const updatedShapes = (shapes[shapeType] || []).map((shapeItem: any) =>
      shapeItem.id === e.target.id()
        ? {
            ...shapeItem,
            x: e.target.x(),
            y: e.target.y()
          }
        : shapeItem
    );

    updateShapes(shapeType, updatedShapes);
  };

  return (
    <div style={{ position: "relative", left: "300px", width: "1200px" }}>
      <h2 style={{ textAlign: "center" }}>Canvas Drawing App</h2>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <ToggleButtonGroup
          value={shape}
          exclusive
          onChange={(e, newShape) => setShape(newShape)}
          aria-label="shape selection"
        >
          <ToggleButton value="" aria-label="select" title="select">
            <HighlightAltIcon />
          </ToggleButton>
          <ToggleButton value="circle" aria-label="circle" title="circle">
            <CircleOutlinedIcon />
          </ToggleButton>
          <ToggleButton value="square" aria-label="square" title="square">
            <SquareOutlinedIcon />
          </ToggleButton>
          <ToggleButton value="triangle" aria-label="triangle" title="triangle">
            <ChangeHistoryOutlinedIcon />
          </ToggleButton>
          <ToggleButton value="star" aria-label="star" title="star">
            <StarBorderOutlinedIcon />
          </ToggleButton>
          <ToggleButton value="line" aria-label="line" title="line">
            <GestureIcon />
          </ToggleButton>
          <ToggleButton value="reset" aria-label="reset" title="reset" onClick={handleReset}>
            <RestartAltIcon />
          </ToggleButton>
          <ToggleButton value="color" aria-label="color" title="color">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ border: "none", padding: 0, background: "transparent" }}
            />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button variant="text" color="secondary" onClick={handleDownload}>
          Download <FileDownloadIcon />
        </Button>
      </div>
      <Stage
        width={1300}
        height={700}
        style={{ backgroundColor: "white" }}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {shapes.circle.map((s) => (
            <KonvaCircle
              key={s.id}
              id={s.id}
              radius={s.radius}
              stroke={s.color}
              x={s.x}
              y={s.y}
              draggable={shape === ""}
              onDragEnd={(e) => handleDragEnd(e, 'circle')}
            />
          ))}
        </Layer>
        <Layer>
          {shapes.square.map((s) => (
            <Rect
              key={s.id}
              id={s.id}
              width={s.width}
              height={s.height}
              stroke={s.color}
              x={s.x}
              y={s.y}
              draggable={shape === ""}
              onDragEnd={(e) => handleDragEnd(e, 'square')}
            />
          ))}
        </Layer>
        <Layer>
          {shapes.star.map((s) => (
            <KonvaStar
              key={s.id}
              id={s.id}
              innerRadius={s.innerRadius}
              outerRadius={s.outerRadius}
              numPoints={5}
              x={s.x}
              y={s.y}
              stroke={s.color}
              draggable={shape === "" }
              onDragEnd={(e) => handleDragEnd(e, 'star')}
            />
          ))}
        </Layer>
        <Layer>
          {shapes.line.map((s) => (
            <KonvaLine
              key={s.id}
              id={s.id}
              points={s.points}
              stroke={s.color}
              onDragEnd={(e) => handleDragEnd(e, 'line')}
            />
          ))}
        </Layer>
        <Layer>
          {shapes.triangle.map((s) => (
            <KonvaLine
              key={s.id}
              id={s.id}
              points={s.points}
              stroke={s.color}
              closed
              x={s.x}
              y={s.y}
              draggable={shape === ""}
              onDragEnd={(e) => handleDragEnd(e, 'triangle')}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawShapes;
