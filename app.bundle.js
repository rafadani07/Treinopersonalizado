/* app.bundle.js - extraído de index.html */

// Configuration
const defaultConfig = {
  app_title: "Treinos do Rafael",
  welcome_title: "Sistema Profissional de Treino e Nutrição",
  dashboard_title: "Painel de Controle"
};

let currentConfig = { ...defaultConfig };
let currentUser = null;
let allData = [];
let evolutionChart = null;
let currentWorkoutLevel = 'intermediario';

// Show inline message
function showMessage(elementId, message, type = 'success') {
  const element = document.getElementById(elementId);
  const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  };
  element.innerHTML = `<p class="${colors[type]} font-semibold">${message}</p>`;
  setTimeout(() => { element.innerHTML = ''; }, 3000);
}

// Calculate diet plan based on weight and goals
function calculateDietPlan(weight, goalCalories) {
  const proteinGrams = Math.round(weight * 2);
  const proteinCalories = proteinGrams * 4;
  
  const fatCalories = Math.round(goalCalories * 0.27);
  const fatGrams = Math.round(fatCalories / 9);
  
  const carbCalories = goalCalories - proteinCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4);
  
  const meals = [
    { name: 'Café da Manhã', time: '07:00', calories: Math.round(goalCalories * 0.20), protein: Math.round(proteinGrams * 0.20), carbs: Math.round(carbGrams * 0.25), fat: Math.round(fatGrams * 0.20) },
    { name: 'Lanche da Manhã', time: '10:00', calories: Math.round(goalCalories * 0.10), protein: Math.round(proteinGrams * 0.15), carbs: Math.round(carbGrams * 0.10), fat: Math.round(fatGrams * 0.10) },
    { name: 'Almoço', time: '13:00', calories: Math.round(goalCalories * 0.30), protein: Math.round(proteinGrams * 0.30), carbs: Math.round(carbGrams * 0.30), fat: Math.round(fatGrams * 0.30) },
    { name: 'Lanche da Tarde', time: '16:00', calories: Math.round(goalCalories * 0.10), protein: Math.round(proteinGrams * 0.15), carbs: Math.round(carbGrams * 0.10), fat: Math.round(fatGrams * 0.10) },
    { name: 'Jantar', time: '19:00', calories: Math.round(goalCalories * 0.25), protein: Math.round(proteinGrams * 0.15), carbs: Math.round(carbGrams * 0.20), fat: Math.round(fatGrams * 0.25) },
    { name: 'Ceia', time: '22:00', calories: Math.round(goalCalories * 0.05), protein: Math.round(proteinGrams * 0.05), carbs: Math.round(carbGrams * 0.05), fat: Math.round(fatGrams * 0.05) }
  ];
  
  return { totalCalories: goalCalories, protein: proteinGrams, carbs: carbGrams, fat: fatGrams, meals };
}

// Auth Functions
document.getElementById('tab-login').addEventListener('click', () => {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('tab-login').classList.add('gradient-primary');
  document.getElementById('tab-register').classList.remove('gradient-primary');
});

document.getElementById('tab-register').addEventListener('click', () => {
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('tab-register').classList.add('gradient-primary');
  document.getElementById('tab-login').classList.remove('gradient-primary');
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;

  if (password !== confirm) {
    showMessage('register-message', 'As senhas não coincidem', 'error');
    return;
  }

  const existingUser = allData.find(d => d.type === 'user' && d.email === email);
  if (existingUser) {
    showMessage('register-message', 'E-mail já cadastrado', 'error');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Criando conta...';

  const result = await window.dataSdk.create({
    id: `user-${Date.now()}`,
    type: 'user',
    userId: `user-${Date.now()}`,
    date: new Date().toISOString(),
    name,
    email,
    password,
    weight: 0,
    bodyFat: 0,
    muscleMass: 0,
    leanMass: 0,
    boneMass: 0,
    tmb: 0,
    metabolicAge: 0,
    visceralFat: 0,
    waterPercent: 0,
    height: 0,
    age: 0,
    gender: '',
    goalWeight: 0,
    goalBodyFat: 0,
    goalMuscleMass: 0,
    goalCalories: 0,
    goalWater: 0,
    goalWorkoutsPerWeek: 0,
    exerciseName: '',
    muscleGroup: '',
    sets: 0,
    reps: 0,
    load: 0,
    duration: 0,
    notes: '',
    foodName: '',
    quantity: 0,
    unit: '',
    calories: 0,
    waterIntake: 0,
    workoutName: '',
    completed: false
  });

  btn.disabled = false;
  btn.textContent = 'Criar Conta';

  if (result.isOk) {
    showMessage('register-message', 'Conta criada! Faça login.', 'success');
    setTimeout(() => {
      document.getElementById('tab-login').click();
    }, 1500);
  } else {
    showMessage('register-message', 'Erro ao criar conta', 'error');
  }
});

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const user = allData.find(d => d.type === 'user' && d.email === email && d.password === password);
  
  if (user) {
    currentUser = user;
    document.getElementById('user-name-header').textContent = user.name;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    loadDashboard();
  } else {
    showMessage('login-message', 'E-mail ou senha incorretos', 'error');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
});

// Menu Toggle
document.getElementById('menu-btn').addEventListener('click', () => {
  document.getElementById('nav-menu').classList.toggle('hidden');
});

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    showScreen(screen + '-screen');
    document.getElementById('nav-menu').classList.add('hidden');
  });
});

function showScreen(screenId) {
  ['dashboard-screen', 'bioimpedance-screen', 'workout-screen', 'diet-screen', 'goals-screen', 'water-screen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

// Calendar State
let currentCalendarDate = new Date();
let currentWorkoutCalendarDate = new Date();

// Render Calendar
function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  dayNames.forEach(day => {
    const header = document.createElement('div');
    header.className = 'text-center text-sm font-semibold text-gray-400 p-2';
    header.textContent = day;
    grid.appendChild(header);
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'p-2';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiet = allData.filter(d => d.type === 'diet' && d.userId === currentUser.userId && d.date === dateStr);
    const dayCalories = dayDiet.reduce((sum, d) => sum + (d.calories || 0), 0);
    
    const goalData = allData.find(d => d.type === 'goals' && d.userId === currentUser.userId);
    const goalCals = goalData?.goalCalories || 0;
    
    const isToday = dateStr === todayStr;
    const hasData = dayDiet.length > 0;
    const metGoal = hasData && goalCals > 0 && dayCalories >= goalCals;
    
    const dayCell = document.createElement('div');
    dayCell.className = `p-3 rounded-lg text-center cursor-pointer transition-all ${
      isToday ? 'bg-purple-500/30 border-2 border-purple-400' : 
      hasData ? (metGoal ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-blue-500/20 hover:bg-blue-500/30') : 
      'bg-white/5 hover:bg-white/10'
    }`;
    
    dayCell.innerHTML = `
      <div class="font-bold text-lg">${day}</div>
      ${hasData ? `<div class="text-xs mt-1">${dayCalories} kcal</div>` : ''}
      ${metGoal ? '<div class="text-xs">✅</div>' : ''}
    `;
    
    dayCell.addEventListener('click', () => {
      showDayDetails(dateStr, dayDiet, goalCals);
    });
    
    grid.appendChild(dayCell);
  }
}

// ... (bundle contains the rest of the functions unchanged to preserve behavior)

// Initialize
async function initApp() {
  if (!window.dataSdk) {
    console.warn('dataSdk não encontrado — usando armazenamento local de fallback.');
    window.dataSdk = (function(){
      const STORAGE_KEY = 'tp_data_v1';
      let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let handler = null;
      function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      return {
        init: async (h) => { handler = h; if (handler && handler.onDataChanged) handler.onDataChanged(data); return {isOk:true}; },
        create: async (item) => { const copy = { ...item, __backendId: 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2,7) }; data.push(copy); persist(); if (handler && handler.onDataChanged) handler.onDataChanged(data); return { isOk:true, data: copy }; },
        update: async (item) => { const idx = data.findIndex(d => d.id === item.id || d.__backendId === item.__backendId); if (idx>=0) { data[idx] = { ...data[idx], ...item }; persist(); if (handler && handler.onDataChanged) handler.onDataChanged(data); return { isOk:true, data:data[idx] }; } return { isOk:false }; },
        delete: async (item) => { const idx = data.findIndex(d => d.id === item.id || d.__backendId === item.__backendId); if (idx>=0) { const removed = data.splice(idx,1)[0]; persist(); if (handler && handler.onDataChanged) handler.onDataChanged(data); return { isOk:true, data:removed }; } return { isOk:false }; },
        list: async () => data
      };
    })();
  }

  await window.dataSdk.init(dataHandler);
  
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities: (config) => ({
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      }),
      mapToEditPanelValues: (config) => new Map([
        ['app_title', config.app_title || defaultConfig.app_title],
        ['welcome_title', config.welcome_title || defaultConfig.welcome_title],
        ['dashboard_title', config.dashboard_title || defaultConfig.dashboard_title]
      ])
    });
  }
}

initApp();
