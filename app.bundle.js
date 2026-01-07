// Bundled app (app.js + remaining inline scripts)

// Original app.js content (first part)

// Extracted from index.html
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
if (document.getElementById('tab-login')) {
  document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('tab-login').classList.add('gradient-primary');
    document.getElementById('tab-register').classList.remove('gradient-primary');
  });
}

if (document.getElementById('tab-register')) {
  document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('tab-register').classList.add('gradient-primary');
    document.getElementById('tab-login').classList.remove('gradient-primary');
  });
}

if (document.getElementById('register-form')) {
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
}


// --- appended from inline script ---

function loadGoalsStatus() {
  const goalData = allData.find(d => d.type === 'goals' && d.userId === currentUser.userId);
  const latestBio = allData.filter(d => d.type === 'bioimpedance' && d.userId === currentUser.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
  const container = document.getElementById('goals-status');
  
  if (!goalData) {
    container.innerHTML = '<p class="text-gray-400">Nenhuma meta definida</p>';
    return;
  }

  document.getElementById('goal-weight').value = goalData.goalWeight || '';
  document.getElementById('goal-bodyfat').value = goalData.goalBodyFat || '';
  document.getElementById('goal-muscle').value = goalData.goalMuscleMass || '';
  document.getElementById('goal-calories-input').value = goalData.goalCalories || '';
  document.getElementById('goal-workouts').value = goalData.goalWorkoutsPerWeek || '';
  document.getElementById('goal-water').value = goalData.goalWater || '';

  const goals = [];
  
  if (goalData.goalWeight > 0 && latestBio) {
    const diff = latestBio.weight - goalData.goalWeight;
    const status = Math.abs(diff) < 1 ? '✅' : diff > 0 ? '🔽' : '🔼';
    goals.push({
      label: 'Peso',
      current: latestBio.weight.toFixed(1),
      goal: goalData.goalWeight.toFixed(1),
      unit: 'kg',
      status
    });
  }

  if (goalData.goalBodyFat > 0 && latestBio) {
    const diff = latestBio.bodyFat - goalData.goalBodyFat;
    const status = Math.abs(diff) < 1 ? '✅' : diff > 0 ? '🔽' : '🔼';
    goals.push({
      label: 'Gordura',
      current: latestBio.bodyFat.toFixed(1),
      goal: goalData.goalBodyFat.toFixed(1),
      unit: '%',
      status
    });
  }

  if (goalData.goalMuscleMass > 0 && latestBio) {
    const diff = latestBio.muscleMass - goalData.goalMuscleMass;
    const status = Math.abs(diff) < 1 ? '✅' : diff < 0 ? '🔼' : '🔽';
    goals.push({
      label: 'Músculo',
      current: latestBio.muscleMass.toFixed(1),
      goal: goalData.goalMuscleMass.toFixed(1),
      unit: 'kg',
      status
    });
  }

  if (goalData.goalWater > 0) {
    document.getElementById('water-goal').textContent = goalData.goalWater;
  }

  if (goals.length === 0) {
    container.innerHTML = '<p class="text-gray-400">Defina suas metas acima</p>';
    return;
  }

  container.innerHTML = goals.map(g => `
    <div class="glass-effect rounded-xl p-4 border border-purple-500/20">
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold">${g.label}</span>
        <span class="text-2xl">${g.status}</span>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Atual</p>
          <p class="text-xl font-bold">${g.current} ${g.unit}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-400">Meta</p>
          <p class="text-xl font-bold text-purple-400">${g.goal} ${g.unit}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Water Tracking
let waterIntake = 0;

document.querySelectorAll('.water-add-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const amount = parseFloat(btn.dataset.amount);
    waterIntake += amount;
    updateWaterProgress();
    await saveWaterData();
  });
});

document.getElementById('water-reset-btn').addEventListener('click', async () => {
  waterIntake = 0;
  updateWaterProgress();
  await saveWaterData();
});

function updateWaterProgress() {
  const goal = parseFloat(document.getElementById('water-goal').textContent) || 3;
  const percent = Math.min((waterIntake / goal) * 100, 100);
  document.getElementById('water-current').textContent = waterIntake.toFixed(1);
  document.getElementById('water-progress').style.width = percent + '%';
  document.getElementById('water-percent').textContent = Math.round(percent) + '%';
}

async function saveWaterData() {
  if (!currentUser) return;
  
  const today = new Date().toISOString().split('T')[0];
  const existing = allData.find(d => d.type === 'water' && d.userId === currentUser.userId && d.date === today);
  
  const waterData = {
    id: existing?.id || `water-${Date.now()}`,
    type: 'water',
    userId: currentUser.userId,
    date: today,
    waterIntake: waterIntake,
    name: '',
    email: '',
    password: '',
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
    workoutName: '',
    completed: false
  };

  if (existing) {
    await window.dataSdk.update({ ...existing, ...waterData });
  } else {
    await window.dataSdk.create(waterData);
  }
}

function loadWaterData() {
  const today = new Date().toISOString().split('T')[0];
  const todayWater = allData.find(d => d.type === 'water' && d.userId === currentUser.userId && d.date === today);
  
  if (todayWater) {
    waterIntake = todayWater.waterIntake || 0;
    updateWaterProgress();
  }
}

// Data Handler
const dataHandler = {
  onDataChanged(data) {
    allData = data;
    
    if (currentUser) {
      loadDashboard();
      loadBioHistory();
      loadWorkoutList();
      loadDietList();
      loadGoalsStatus();
      loadWaterData();
    }
  }
};

// Config Management
async function onConfigChange(config) {
  currentConfig = config;
  document.getElementById('app-title').textContent = config.app_title || defaultConfig.app_title;
  
  const welcomeTitleElements = document.querySelectorAll('#welcome-title');
  welcomeTitleElements.forEach(el => {
    el.textContent = config.welcome_title || defaultConfig.welcome_title;
  });
  
  const dashboardTitleElement = document.getElementById('dashboard-title');
  if (dashboardTitleElement) {
    dashboardTitleElement.textContent = config.dashboard_title || defaultConfig.dashboard_title;
  }
}

// Initialize
async function initApp() {
  if (window.dataSdk) {
    await window.dataSdk.init(dataHandler);
  }
  
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
