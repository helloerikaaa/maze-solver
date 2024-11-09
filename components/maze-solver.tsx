"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

// Maze cell types
type Cell = "empty" | "wall" | "start" | "end" | "path";

// Robot directions
type Direction = "up" | "right" | "down" | "left";

const MAZE_SIZE = 10;

export default function Component() {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [robotPosition, setRobotPosition] = useState<[number, number]>([0, 0]);
  const [robotDirection, setRobotDirection] = useState<Direction>("right");
  const [solving, setSolving] = useState(false);
  const [solved, setSolved] = useState(false);

  // Generate a new maze
  const generateMaze = useCallback(() => {
    const newMaze: Cell[][] = Array(MAZE_SIZE)
      .fill(null)
      .map(() => Array(MAZE_SIZE).fill("empty"));

    // Add walls
    for (let i = 0; i < MAZE_SIZE; i++) {
      for (let j = 0; j < MAZE_SIZE; j++) {
        if (Math.random() < 0.3) {
          newMaze[i][j] = "wall";
        }
      }
    }

    // Set start and end
    newMaze[0][0] = "start";
    newMaze[MAZE_SIZE - 1][MAZE_SIZE - 1] = "end";

    setMaze(newMaze);
    setRobotPosition([0, 0]);
    setRobotDirection("right");
    setSolved(false);
  }, []);

  // Initialize maze
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  // Solve the maze using the right-hand rule
  const solveMaze = useCallback(() => {
    if (solved) return;

    const [x, y] = robotPosition;
    let [newX, newY] = [x, y];
    let newDirection = robotDirection;

    // Check if we've reached the end
    if (maze[x][y] === "end") {
      setSolved(true);
      setSolving(false);
      return;
    }

    // Try to move right relative to the current direction
    switch (robotDirection) {
      case "up":
        newDirection = "right";
        newX = x;
        newY = y + 1;
        break;
      case "right":
        newDirection = "down";
        newX = x + 1;
        newY = y;
        break;
      case "down":
        newDirection = "left";
        newX = x;
        newY = y - 1;
        break;
      case "left":
        newDirection = "up";
        newX = x - 1;
        newY = y;
        break;
    }

    // If the new position is valid and not a wall, move there
    if (
      newX >= 0 &&
      newX < MAZE_SIZE &&
      newY >= 0 &&
      newY < MAZE_SIZE &&
      maze[newX][newY] !== "wall"
    ) {
      setRobotPosition([newX, newY]);
      setRobotDirection(newDirection);
      if (maze[newX][newY] === "empty") {
        const newMaze = [...maze];
        newMaze[newX][newY] = "path";
        setMaze(newMaze);
      }
    } else {
      // If we can't move right, rotate left and stay in the same position
      setRobotDirection((prevDirection) => {
        switch (prevDirection) {
          case "up":
            return "left";
          case "left":
            return "down";
          case "down":
            return "right";
          case "right":
            return "up";
        }
      });
    }
  }, [maze, robotPosition, robotDirection, solved]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (solving && !solved) {
      interval = setInterval(solveMaze, 200);
    }
    return () => clearInterval(interval);
  }, [solving, solved, solveMaze]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Explorador autónomo </h1>
      <div className="grid grid-cols-10 gap-1 mb-4">
        {maze.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`w-10 h-10 border ${
                cell === "wall"
                  ? "bg-gray-800"
                  : cell === "start"
                    ? "bg-green-500"
                    : cell === "end"
                      ? "bg-red-500"
                      : cell === "path"
                        ? "bg-blue-300"
                        : "bg-white"
              } ${robotPosition[0] === i && robotPosition[1] === j ? "relative" : ""}`}
            >
              {robotPosition[0] === i && robotPosition[1] === j && (
                <div
                  className={`absolute inset-0 flex items-center justify-center text-2xl
                  ${
                    robotDirection === "up"
                      ? "rotate-0"
                      : robotDirection === "right"
                        ? "rotate-90"
                        : robotDirection === "down"
                          ? "rotate-180"
                          : "rotate-270"
                  }`}
                >
                  🤖
                </div>
              )}
            </div>
          )),
        )}
      </div>
      <div className="flex space-x-5">
        <Button onClick={generateMaze} disabled={solving}>
          Nuevo Laberinto
        </Button>
        <Button onClick={() => setSolving((prev) => !prev)} disabled={solved}>
          {solving ? "Detener" : "Comenzar"}
        </Button>
      </div>
      {solved && (
        <p className="mt-4 text-xl font-bold text-green-600">
          Laberinto Resuelto!
        </p>
      )}
    </div>
  );
}
