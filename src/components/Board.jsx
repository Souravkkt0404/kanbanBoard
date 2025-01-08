import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

export default function Board() {
  const [completed, setCompleted] = useState([]);
  const [incomplete, setIncomplete] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [inReview, setInReview] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((response) => response.json())
      .then((json) => {
        setCompleted(json.filter((task) => task.completed));
        setIncomplete(json.filter((task) => !task.completed));
      });
  }, []);

  // Delete task
  const handleDeleteTask = (id) => {
    setCompleted(completed.filter((task) => task.id !== id));
    setIncomplete(incomplete.filter((task) => task.id !== id));
    setInReview(inReview.filter((task) => task.id !== id));
    setBacklog(backlog.filter((task) => task.id !== id));
  };

  // Edit task
  const handleEditTask = (id, newTitle) => {
    const updatedTask = {
      ...findItemById(id, [
        ...incomplete,
        ...completed,
        ...inReview,
        ...backlog,
      ]),
      title: newTitle,
    };

    setCompleted(
      completed.map((task) => (task.id === id ? updatedTask : task))
    );
    setIncomplete(
      incomplete.map((task) => (task.id === id ? updatedTask : task))
    );
    setInReview(inReview.map((task) => (task.id === id ? updatedTask : task)));
    setBacklog(backlog.map((task) => (task.id === id ? updatedTask : task)));
  };

  // Helper functions
  function findItemById(id, array) {
    return array.find((item) => item.id === Number(id));}

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
   

    // If dropping in the same place
    if (source.droppableId === destination.droppableId) {
      console.log("Dropped in the same column");
      return;
    }

    if (!destination || source.droppableId === destination.droppableId) return;

    deletePreviousState(source.droppableId, draggableId);

    const task = findItemById(draggableId, [
      ...incomplete,
      ...completed,
      ...inReview,
      ...backlog,
    ]);

    if (task) {
      setNewState(destination.droppableId, task);
    } else {
      console.log("Task not found with ID:", draggableId); // In case task is undefined
    }
  };

  function deletePreviousState(sourceDroppableId, taskId) {
    switch (sourceDroppableId) {
      case "1":
        setIncomplete(removeItemById(taskId, incomplete));
        break;
      case "2":
        setCompleted(removeItemById(taskId, completed));
        break;
      case "3":
        setInReview(removeItemById(taskId, inReview));
        break;
      case "4":
        setBacklog(removeItemById(taskId, backlog));
        break;
      default:
        break;
    }
  }

  function setNewState(destinationDroppableId, task) {
    let updatedTask = { ...task };
    switch (destinationDroppableId) {
      case "1":
        updatedTask = { ...task, completed: false };
        setIncomplete((prev) => [...prev, updatedTask]);
        break;
      case "2":
        updatedTask = { ...task, completed: true };
        setCompleted((prev) => [...prev, updatedTask]);
        break;
      case "3":
        updatedTask = { ...task, completed: false };
        setInReview((prev) => [...prev, updatedTask]);
        break;
      case "4":
        updatedTask = { ...task, completed: false };
        setBacklog((prev) => [...prev, updatedTask]);
        break;
      default:
        break;
    }
  }

  function removeItemById(id, array) {
    return array.filter((item) => item.id !== id);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <h2 style={{ textAlign: "center" }}>PROGRESS BOARD</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          width: "1300px",
          margin: "0 auto",
        }}
      >
        <Column
          title={"TO DO"}
          tasks={incomplete}
          id={"1"}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
        <Column
          title={"DONE"}
          tasks={completed}
          id={"2"}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
        <Column
          title={"IN REVIEW"}
          tasks={inReview}
          id={"3"}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
        <Column
          title={"BACKLOG"}
          tasks={backlog}
          id={"4"}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      </div>
    </DragDropContext>
  );
}
