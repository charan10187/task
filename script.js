document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskName = document.getElementById('task-name');
  const taskPriority = document.getElementById('task-priority');
  const taskList = document.getElementById('tasks');
  const filterPriority = document.getElementById('filter-priority');
  const filterStatus = document.getElementById('filter-status');
  const totalTasks = document.getElementById('total-tasks');
  const completedTasks = document.getElementById('completed-tasks');
  const pendingTasks = document.getElementById('pending-tasks');
  const taskBarChartCanvas = document.getElementById('taskBarChart');
  const taskPieChartCanvas = document.getElementById('taskPieChart');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let timer = null;
  let activeTaskIndex = null;

  // Utility function to format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Initialize Charts
  const taskBarChart = new Chart(taskBarChartCanvas, {
    type: 'bar',
    data: {
      labels: ['Pending', 'Completed'],
      datasets: [
        {
          label: 'Task Count',
          data: [0, 0],
          backgroundColor: ['#FFCC00', '#4CAF50'],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const taskPieChart = new Chart(taskPieChartCanvas, {
    type: 'pie',
    data: {
      labels: ['Pending', 'Completed'],
      datasets: [
        {
          label: 'Task Percentage',
          data: [0, 0],
          backgroundColor: ['#FFCC00', '#4CAF50'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(1)}%`;
            },
          },
        },
      },
    },
  });

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const updateChart = () => {
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const pending = tasks.filter((task) => task.status === 'pending').length;

    taskBarChart.data.datasets[0].data = [pending, completed];
    taskBarChart.update();

    const totalTasksCount = tasks.length;
    const completedPercentage = totalTasksCount > 0 ? (completed / totalTasksCount) * 100 : 0;
    const pendingPercentage = 100 - completedPercentage;

    taskPieChart.data.datasets[0].data = [pendingPercentage, completedPercentage];
    taskPieChart.update();
  };

  const renderTasks = () => {
    taskList.innerHTML = '';
    const filteredTasks = tasks.filter((task) => {
      return (
        (filterPriority.value === 'all' || task.priority === filterPriority.value) &&
        (filterStatus.value === 'all' || task.status === filterStatus.value)
      );
    });
    filteredTasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `${task.priority} task-item`;
      li.innerHTML = `
        <span>${task.name} (${task.priority}) - ${task.status}</span>
        <div>
          <span class="timer" id="timer-${index}">${formatTime(task.timeSpent)}</span>
          <button onclick="toggleStatus(${index})"><i class="fas fa-check-circle"></i></button>
          <button onclick="startTimer(${index})"><i class="fas fa-play-circle"></i></button>
          <button onclick="stopTimer(${index})"><i class="fas fa-stop-circle"></i></button>
          <button onclick="deleteTask(${index})"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      taskList.appendChild(li);
    });

    updateSummary();
    updateChart();
  };

  const updateSummary = () => {
    totalTasks.textContent = `Total Tasks: ${tasks.length}`;
    completedTasks.textContent = `Completed Tasks: ${tasks.filter((task) => task.status === 'completed').length}`;
    pendingTasks.textContent = `Pending Tasks: ${tasks.filter((task) => task.status === 'pending').length}`;
  };

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
      name: taskName.value,
      priority: taskPriority.value,
      status: 'pending',
      timeSpent: 0,
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
  });

  filterPriority.addEventListener('change', renderTasks);
  filterStatus.addEventListener('change', renderTasks);

  window.toggleStatus = (index) => {
    tasks[index].status = tasks[index].status === 'pending' ? 'completed' : 'pending';
    saveTasks();
    renderTasks();
  };

  window.startTimer = (index) => {
    if (activeTaskIndex !== null && timer) {
      alert('A timer is already running. Stop it before starting another.');
      return;
    }
    activeTaskIndex = index;
    console.log(`Started timer for task: ${tasks[index].name}`);
    timer = setInterval(() => {
      tasks[activeTaskIndex].timeSpent++;
      const formattedTime = formatTime(tasks[activeTaskIndex].timeSpent);
      document.getElementById(`timer-${activeTaskIndex}`).textContent = formattedTime;
      console.log(`Task "${tasks[activeTaskIndex].name}" Time Spent: ${formattedTime}`);
      saveTasks();
    }, 1000);
  };

  window.stopTimer = (index) => {
    if (timer && activeTaskIndex === index) {
      clearInterval(timer);
      console.log(`Stopped timer for task: ${tasks[index].name}`);
      timer = null;
      activeTaskIndex = null;
      saveTasks();
      renderTasks();
    } else {
      alert('No timer is running for this task.');
    }
  };

  window.deleteTask = (index) => {
    if (timer && activeTaskIndex === index) {
      clearInterval(timer);
      timer = null;
      activeTaskIndex = null;
    }
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  };

  renderTasks();
});
