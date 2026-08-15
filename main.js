const startScreen = document.querySelector('[data-screen="start"]');
const sceneScreen = document.querySelector('[data-screen="scene"]');
const mainScreen = document.querySelector('[data-screen="main"]');
const startButton = document.getElementById("start-button");
const selectSceneButton = document.getElementById("select-scene-button");
const sceneProgress = document.getElementById("scene-progress");
const sceneTitle = document.getElementById("scene-title");
const sceneDescription = document.getElementById("scene-description");
const sceneImagePlaceholder = document.getElementById("scene-image-placeholder");
const mainSceneTitle = document.getElementById("main-scene-title");
const windowStage = document.getElementById("window-stage");
const envToggle = document.getElementById("env-toggle");
const envPanel = document.getElementById("env-panel");
const weatherCanvas = document.getElementById("weather-canvas");
const weatherContext = weatherCanvas ? weatherCanvas.getContext("2d") : null;
const selectorOptions = document.querySelectorAll(".selector-option");
const sceneArrows = document.querySelectorAll(".scene-arrow");
const mixerToggle = document.getElementById("mixer-toggle");
const mixerPanel = document.getElementById("mixer-panel");
const mixerList = document.getElementById("mixer-list");
const isHttpProtocol = window.location.protocol === "http:" || window.location.protocol === "https:";

const soundChannels = [
	{ id: "rain", label: "빗소리", icon: "☔", source: "assets/sounds/sound-rain.mp3" },
	{ id: "wind", label: "바람소리", icon: "〰", source: "assets/sounds/sound-wind.mp3" },
	{ id: "thunder", label: "천둥소리", icon: "⚡", source: "assets/sounds/sound-thunder.mp3" },
	{ id: "fireplace", label: "장작 타는 소리", icon: "♨", source: "assets/sounds/sound-fireplace.mp3" },
	{ id: "cafeChatter", label: "사람들 웅성거리는 소리", icon: "☕", source: "assets/sounds/sound-cafe-chatter.mp3" },
	{ id: "pencil", label: "연필 소리", icon: "✎", source: "assets/sounds/sound-pencil.mp3" },
	{ id: "train", label: "기차소리", icon: "▣", source: "assets/sounds/sound-train.mp3" },
	{ id: "whiteNoise", label: "화이트 노이즈", icon: "◌", source: "assets/sounds/sound-white-noise.mp3" },
];

const audioChannels = new Map();

const scenes = [
	{
		title: "다락방의 창문",
		description: "조용히 머물 수 있는 다락방 풍경",
		background: "url(assets/images/attic-window.png)",
		backgroundPosition: "center",
		backgroundSize: "contain",
		backgroundAspectRatio: 9 / 16,
		weatherMask: "assets/images/attic-window-mask.png",
	},
	{
		title: "카페 창가",
		description: "잔잔한 실내 소음 속에서 집중하기 좋은 창가 풍경",
		background: "url(assets/images/cafe-window.png)",
		backgroundPosition: "center",
		backgroundSize: "contain",
		backgroundAspectRatio: 9 / 16,
		weatherMask: "assets/images/cafe-window-mask.png",
	},
	{
		title: "우주정거장의 창밖",
		description: "고요한 우주를 바라보며 호흡을 가다듬는 풍경",
		background: "url(assets/images/space-station-window.png)",
		backgroundPosition: "center",
		backgroundSize: "contain",
		backgroundAspectRatio: 9 / 16,
		weatherMask: "assets/images/space-station-window-mask.png",
	},
	{
		title: "숲속 오두막의 창문",
		description: "초록빛 기운과 함께 편안히 쉬는 숲속 풍경",
		background: "linear-gradient(135deg, #1f2f3f 0%, #32516a 100%)",
		backgroundPosition: "center",
		backgroundSize: "contain",
		backgroundAspectRatio: 9 / 16,
		weatherMask: "",
	},
	{
		title: "열차 침대칸의 창문",
		description: "규칙적인 진동감으로 마음을 안정시키는 열차 풍경",
		background: "linear-gradient(135deg, #2a2f43 0%, #4b5678 100%)",
		backgroundPosition: "center",
		backgroundSize: "contain",
		backgroundAspectRatio: 9 / 16,
		weatherMask: "",
	},
];

let currentSceneIndex = 0;
let selectedWeather = "맑음";
let selectedTime = "아침";
let weatherMode = "none";
let weatherParticles = [];
let weatherWidth = 0;
let weatherHeight = 0;
let weatherDpr = Math.min(window.devicePixelRatio || 1, 2);
let weatherLastFrameTime = performance.now();
const maskLoadState = new Map();
let didWarnAboutFileProtocol = false;

function ensureMaskLoaded(maskPath) {
	if (!maskPath) {
		return "none";
	}

	const currentState = maskLoadState.get(maskPath);

	if (currentState === "loaded" || currentState === "error" || currentState === "loading") {
		return currentState;
	}

	maskLoadState.set(maskPath, "loading");
	const image = new Image();

	image.addEventListener("load", () => {
		maskLoadState.set(maskPath, "loaded");
		syncMaskPresentation();
	});

	image.addEventListener("error", () => {
		maskLoadState.set(maskPath, "error");
		console.warn(`[Quiet Window] 창문 마스크를 불러오지 못했습니다: ${maskPath}`);
	});

	image.src = maskPath;
	return "loading";
}

function randomRange(min, max) {
	return min + Math.random() * (max - min);
}

function getCurrentScene() {
	return scenes[currentSceneIndex];
}

function syncMaskPresentation() {
	if (!windowStage) {
		return;
	}

	const currentScene = getCurrentScene();
	const hasWeatherMask = Boolean(currentScene.weatherMask);

	if (!isHttpProtocol && hasWeatherMask && !didWarnAboutFileProtocol) {
		console.warn("[Quiet Window] PNG 마스크는 file://에서 사용하지 않습니다. Live Server 등 http:// 환경에서 실행해 주세요.");
		didWarnAboutFileProtocol = true;
	}

	if (isHttpProtocol && hasWeatherMask) {
		ensureMaskLoaded(currentScene.weatherMask);
	}

	const canUseMask = isHttpProtocol && hasWeatherMask;

	windowStage.classList.toggle("use-mask", canUseMask);
	windowStage.style.setProperty("--window-mask-image", canUseMask ? `url(${currentScene.weatherMask})` : "none");
}

class RainDrop {
	constructor() {
		this.reset(true);
	}

	reset(initial = false) {
		const depth = Math.random();

		this.x = Math.random() * weatherWidth;
		this.y = initial ? Math.random() * weatherHeight : -randomRange(20, 160);
		this.length = 8 + depth * 20;
		this.speed = 160 + depth * 220;
		this.wind = -16 - Math.random() * 20;
		this.width = 0.45 + depth * 1.1;
		this.alpha = 0.08 + depth * 0.26;
	}

	update(deltaSeconds) {
		this.x += this.wind * deltaSeconds;
		this.y += this.speed * deltaSeconds;

		if (this.y > weatherHeight + 70 || this.x < -90 || this.x > weatherWidth + 90) {
			this.reset();
		}
	}

	draw() {
		if (!weatherContext) {
			return;
		}

		const driftX = this.wind * 0.075;
		weatherContext.beginPath();
		weatherContext.moveTo(this.x, this.y);
		weatherContext.lineTo(this.x + driftX, this.y + this.length);
		weatherContext.strokeStyle = `rgba(210, 230, 255, ${this.alpha})`;
		weatherContext.lineWidth = this.width;
		weatherContext.lineCap = "round";
		weatherContext.stroke();
	}
}

class SnowFlake {
	constructor() {
		this.reset(true);
	}

	reset(initial = false) {
		const depth = Math.random();

		this.baseX = Math.random() * weatherWidth;
		this.x = this.baseX;
		this.y = initial ? Math.random() * weatherHeight : -randomRange(6, 40);
		this.radius = 0.6 + depth * 2.2;
		this.speed = 14 + depth * 44;
		this.wind = randomRange(-8, 6);
		this.swing = 6 + Math.random() * 16;
		this.swingSpeed = 0.22 + Math.random() * 0.62;
		this.phase = Math.random() * Math.PI * 2;
		this.alpha = 0.2 + depth * 0.62;
	}

	update(deltaSeconds, timeSeconds) {
		this.y += this.speed * deltaSeconds;
		this.baseX += this.wind * deltaSeconds;
		this.x = this.baseX + Math.sin(timeSeconds * this.swingSpeed + this.phase) * this.swing;

		if (this.y > weatherHeight + 20 || this.x < -24 || this.x > weatherWidth + 24) {
			this.reset();
		}
	}

	draw() {
		if (!weatherContext) {
			return;
		}

		weatherContext.beginPath();
		weatherContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		weatherContext.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
		weatherContext.fill();
	}
}

function createWeatherParticles() {
	weatherParticles = [];

	if (!weatherWidth || !weatherHeight) {
		return;
	}

	if (weatherMode === "rain") {
		const rainCount = Math.floor(Math.min(180, weatherWidth * 0.24));

		for (let index = 0; index < rainCount; index += 1) {
			weatherParticles.push(new RainDrop());
		}
	}

	if (weatherMode === "snow") {
		const snowCount = Math.floor(Math.min(120, weatherWidth * 0.17));

		for (let index = 0; index < snowCount; index += 1) {
			weatherParticles.push(new SnowFlake());
		}
	}
}

function resizeWeatherCanvas() {
	if (!weatherCanvas || !weatherContext) {
		return;
	}

	const bounds = weatherCanvas.getBoundingClientRect();

	weatherWidth = bounds.width;
	weatherHeight = bounds.height;
	weatherDpr = Math.min(window.devicePixelRatio || 1, 2);

	weatherCanvas.width = Math.max(1, Math.floor(weatherWidth * weatherDpr));
	weatherCanvas.height = Math.max(1, Math.floor(weatherHeight * weatherDpr));
	weatherContext.setTransform(weatherDpr, 0, 0, weatherDpr, 0, 0);
	createWeatherParticles();
}

function setWeatherMode(mode) {
	if (weatherMode === mode) {
		return;
	}

	weatherMode = mode;
	createWeatherParticles();
}

function animateWeather(now) {
	if (!weatherContext) {
		requestAnimationFrame(animateWeather);
		return;
	}

	const deltaSeconds = Math.min((now - weatherLastFrameTime) / 1000, 0.05);
	weatherLastFrameTime = now;

	weatherContext.clearRect(0, 0, weatherWidth, weatherHeight);

	const currentTime = now / 1000;
	const canRender = weatherMode !== "none" && document.body.classList.contains("view-main") && windowStage && !windowStage.classList.contains("is-hidden");

	if (canRender) {
		for (const particle of weatherParticles) {
			particle.update(deltaSeconds, currentTime);
			particle.draw();
		}
	}

	requestAnimationFrame(animateWeather);
}

function renderSceneCard() {
	const currentScene = scenes[currentSceneIndex];

	if (sceneProgress) {
		sceneProgress.textContent = `${currentSceneIndex + 1} / ${scenes.length}`;
	}

	if (sceneTitle) {
		sceneTitle.textContent = currentScene.title;
	}

	if (sceneDescription) {
		sceneDescription.textContent = currentScene.description;
	}

	if (sceneImagePlaceholder) {
		sceneImagePlaceholder.style.background = currentScene.background;
		sceneImagePlaceholder.style.backgroundPosition = currentScene.backgroundPosition;
		sceneImagePlaceholder.style.backgroundSize = currentScene.backgroundSize;
		sceneImagePlaceholder.style.backgroundRepeat = "no-repeat";
	}
}

function moveScene(direction) {
	if (direction === "next") {
		currentSceneIndex = (currentSceneIndex + 1) % scenes.length;
	} else {
		currentSceneIndex = (currentSceneIndex - 1 + scenes.length) % scenes.length;
	}

	renderSceneCard();
}

function closeSelectorPanels() {
	if (envPanel) {
		envPanel.classList.add("is-hidden");
	}

	if (envToggle) {
		envToggle.setAttribute("aria-expanded", "false");
	}
}

function renderEnvToggleLabel() {
	if (envToggle) {
		envToggle.textContent = `환경 선택: ${selectedWeather} · ${selectedTime}`;
	}
}

function renderMainScene() {
	syncMaskPresentation();
}

function renderTimeOverlay() {
	if (!windowStage) {
		return;
	}

	windowStage.classList.remove("time-morning", "time-sunset", "time-evening");

	if (selectedTime === "노을") {
		windowStage.classList.add("time-sunset");
		return;
	}

	if (selectedTime === "저녁") {
		windowStage.classList.add("time-evening");
		return;
	}

	windowStage.classList.add("time-morning");
}

function syncWindowStageBounds() {
	if (!windowStage) {
		return;
	}

	const currentScene = getCurrentScene();
	const canShow = isHttpProtocol && Boolean(currentScene.weatherMask) && document.body.classList.contains("view-main");

	if (!canShow) {
		windowStage.classList.add("is-hidden");
		return;
	}

	windowStage.classList.remove("is-hidden");

	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const imageAspectRatio = currentScene.backgroundAspectRatio || 9 / 16;

	let drawWidth = viewportWidth;
	let drawHeight = viewportWidth / imageAspectRatio;

	if (drawHeight > viewportHeight) {
		drawHeight = viewportHeight;
		drawWidth = viewportHeight * imageAspectRatio;
	}

	const offsetLeft = (viewportWidth - drawWidth) / 2;
	const offsetTop = (viewportHeight - drawHeight) / 2;

	windowStage.style.left = `${offsetLeft}px`;
	windowStage.style.top = `${offsetTop}px`;
	windowStage.style.width = `${drawWidth}px`;
	windowStage.style.height = `${drawHeight}px`;
	resizeWeatherCanvas();
}

function renderWeatherOverlay() {
	if (!weatherCanvas || !windowStage) {
		return;
	}

	const currentScene = getCurrentScene();
	const hasWeatherArea = Boolean(currentScene.weatherMask);
	const nextMode = selectedWeather === "비" ? "rain" : selectedWeather === "눈" ? "snow" : "none";

	syncMaskPresentation();

	if (!isHttpProtocol || !hasWeatherArea || !document.body.classList.contains("view-main")) {
		setWeatherMode("none");
		return;
	}

	setWeatherMode(nextMode);
}

function createMixer() {
	if (!mixerList) {
		return;
	}

	for (const channel of soundChannels) {
		const audio = new Audio(channel.source);
		audio.loop = true;
		audio.preload = "none";
		audio.volume = 0;
		audio.addEventListener("error", () => {
			const control = mixerList.querySelector(`[data-channel-id="${channel.id}"]`);
			control?.classList.add("is-unavailable");
			const status = control?.querySelector(".mixer-status");
			if (status) {
				status.textContent = "파일 준비 중";
			}
		});
		audioChannels.set(channel.id, audio);

		const control = document.createElement("article");
		control.className = "mixer-control";
		control.dataset.channelId = channel.id;
		control.innerHTML = `
			<div class="mixer-control-heading">
				<span class="mixer-icon" aria-hidden="true">${channel.icon}</span>
				<h4>${channel.label}</h4>
				<span class="mixer-value" data-value-for="${channel.id}">0</span>
			</div>
			<label class="mixer-slider-label" for="mixer-${channel.id}">${channel.label} 볼륨</label>
			<input class="mixer-slider" id="mixer-${channel.id}" type="range" min="0" max="100" value="0" data-channel-id="${channel.id}" aria-label="${channel.label} 볼륨" />
			<p class="mixer-status" aria-live="polite">파일 확인 중</p>
		`;
		mixerList.append(control);
	}

	mixerList.addEventListener("input", (event) => {
		const slider = event.target.closest(".mixer-slider");
		if (!slider) {
			return;
		}

		const channelId = slider.dataset.channelId;
		const volume = Number(slider.value);
		const valueLabel = mixerList.querySelector(`[data-value-for="${channelId}"]`);
		const audio = audioChannels.get(channelId);

		if (valueLabel) {
			valueLabel.textContent = String(volume);
		}

		if (!audio) {
			return;
		}

		audio.volume = volume / 100;
		if (volume > 0) {
			audio.play().catch(() => {});
		} else {
			audio.pause();
		}
	});
}

function toggleMixerPanel() {
	if (!mixerToggle || !mixerPanel) {
		return;
	}

	const willOpen = mixerPanel.classList.contains("is-hidden");
	mixerPanel.classList.toggle("is-hidden", !willOpen);
	mixerToggle.textContent = willOpen ? "사운드 믹서 닫기" : "사운드 믹서 열기";
	mixerToggle.setAttribute("aria-expanded", String(willOpen));
}

function toggleEnvPanel() {
	if (!envPanel || !envToggle) {
		return;
	}

	const willOpen = envPanel.classList.contains("is-hidden");
	envPanel.classList.toggle("is-hidden", !willOpen);
	envToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

for (const arrowButton of sceneArrows) {
	arrowButton.addEventListener("click", () => {
		const direction = arrowButton.dataset.direction;
		moveScene(direction === "next" ? "next" : "prev");
	});
}

renderSceneCard();
renderEnvToggleLabel();
renderMainScene();
renderTimeOverlay();
syncWindowStageBounds();
renderWeatherOverlay();
createMixer();

if (startButton && startScreen && sceneScreen) {
	startButton.addEventListener("click", () => {
		startScreen.classList.add("is-hidden");
		sceneScreen.classList.remove("is-hidden");
	});
}

if (selectSceneButton && sceneScreen && mainScreen) {
	selectSceneButton.addEventListener("click", () => {
		const selectedScene = scenes[currentSceneIndex];

		if (mainSceneTitle) {
			mainSceneTitle.textContent = selectedScene.title;
		}

		document.body.classList.add("view-main");
		document.body.style.setProperty("--scene-bg", selectedScene.background);
		document.body.style.setProperty("--scene-bg-position", selectedScene.backgroundPosition);
		document.body.style.setProperty("--scene-bg-size", selectedScene.backgroundSize);

		sceneScreen.classList.add("is-hidden");
		mainScreen.classList.remove("is-hidden");
		renderMainScene();
		renderTimeOverlay();
		syncWindowStageBounds();
		renderWeatherOverlay();
	});
}

if (envToggle) {
	envToggle.addEventListener("click", () => {
		toggleEnvPanel();
	});
}

if (mixerToggle) {
	mixerToggle.addEventListener("click", toggleMixerPanel);
}

for (const optionButton of selectorOptions) {
	optionButton.addEventListener("click", () => {
		const selectedType = optionButton.dataset.type;
		const selectedValue = optionButton.dataset.value;

		if (selectedType === "weather" && selectedValue) {
			selectedWeather = selectedValue;
		}

		if (selectedType === "time" && selectedValue) {
			selectedTime = selectedValue;
		}

		renderEnvToggleLabel();
		closeSelectorPanels();
		renderTimeOverlay();
		syncWindowStageBounds();
		renderWeatherOverlay();
	});
}

window.addEventListener("resize", () => {
	syncWindowStageBounds();
});

document.addEventListener("click", (event) => {
	const clickedElement = event.target;

	if (!(clickedElement instanceof Element)) {
		return;
	}

	const clickedInsideSelector = clickedElement.closest(".selector-group");

	if (!clickedInsideSelector) {
		closeSelectorPanels();
	}
});

requestAnimationFrame(animateWeather);
