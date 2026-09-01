const asyncHandler = require('../utils/asyncHandler');
const taskService = require('../services/taskService');

const createTask = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;

  const task = await taskService.createTask(
    roomId,
    { title, description, assignedTo, priority, dueDate },
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

const getRoomTasks = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { status, priority } = req.query;

  const tasks = await taskService.getRoomTasks(roomId, { status, priority }, req.user.id);

  res.status(200).json({
    success: true,
    data: tasks
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updateData = req.body;

  const task = await taskService.updateTask(taskId, updateData, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const result = await taskService.deleteTask(taskId, req.user.id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  createTask,
  getRoomTasks,
  updateTask,
  deleteTask
};
