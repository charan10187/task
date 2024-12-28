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

  // Initialize Bar Chart (Task Count by Status)
  const taskBarChart = new Chart(taskBarChartCanvas, {
    type: 'bar',
    data: {
      labels: ['Pending', 'Completed'],
      datasets: [{
        label: 'Task Count',
        data: [0, 0], // Default data for Pending and Completed tasks
        backgroundColor: ['#FFCC00', '#4CAF50'],
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Initialize Pie Chart (Percentage of Tasks by Status)
  const taskPieChart = new Chart(taskPieChartCanvas, {
    type: 'pie',
    data: {
      labels: ['Pending', 'Completed'],
      datasets: [{
        label: 'Task Percentage',
        data: [0, 0], // Default data for Pending and Completed percentages
        backgroundColor: ['#FFCC00', '#4CAF50'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return `${tooltipItem.label}: ${tooltipItem.raw}%`;
            }
          }
        }
      }
    }
  });

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const updateChart = () => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;

    // Update Bar Chart data
    taskBarChart.data.datasets[0].data = [pending, completed];
    taskBarChart.update();

    // Update Pie Chart data (in percentage)
    const totalTasksCount = tasks.length;
    const completedPercentage = totalTasksCount > 0 ? (completed / totalTasksCount) * 100 : 0;
    const pendingPercentage = 100 - completedPercentage;

    taskPieChart.data.datasets[0].data = [pendingPercentage, completedPercentage];
    taskPieChart.update();
  };

  const renderTasks = () => {
    taskList.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
      return (
        (filterPriority.value === 'all' || task.priority === filterPriority.value) &&
        (filterStatus.value === 'all' || task.status === filterStatus.value)
      );
    });
    filteredTasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = task.priority;
      li.innerHTML = `
        <span>${task.name} (${task.priority}) - ${task.status}</span>
        <div>
          <button onclick="toggleStatus(${index})"><i class="fas fa-check-circle"></i></button>
          <button onclick="deleteTask(${index})"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      taskList.appendChild(li);
    });

    updateSummary();
    updateChart(); // Update chart after rendering tasks
  };

  const updateSummary = () => {
    totalTasks.textContent = `Total Tasks: ${tasks.length}`;
    completedTasks.textContent = `Completed Tasks: ${tasks.filter(task => task.status === 'completed').length}`;
    pendingTasks.textContent = `Pending Tasks: ${tasks.filter(task => task.status === 'pending').length}`;
  };

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
      name: taskName.value,
      priority: taskPriority.value,
      status: 'pending'
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

  window.deleteTask = (index) => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  };

  renderTasks();
});
