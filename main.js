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
const envToggle = document.getElementById("env-toggle");
const envPanel = document.getElementById("env-panel");
const selectorOptions = document.querySelectorAll(".selector-option");
const sceneArrows = document.querySelectorAll(".scene-arrow");

const scenes = [
	{
		title: "다락방",
		description: "빗소리와 함께 조용히 머물 수 있는 다락방 풍경",
		background: "url(assets/images/garret.png)",
		backgroundPosition: "center",
		backgroundSize: "contain",
	},
	{
		title: "카페",
		description: "잔잔한 실내 소음 속에서 집중하기 좋은 창가 풍경",
		background: "linear-gradient(135deg, #2a364f 0%, #4a5c7d 100%)",
		backgroundPosition: "center",
		backgroundSize: "cover",
	},
	{
		title: "우주정거장",
		description: "고요한 우주를 바라보며 호흡을 가다듬는 풍경",
		background: "linear-gradient(135deg, #16233d 0%, #2d406a 100%)",
		backgroundPosition: "center",
		backgroundSize: "cover",
	},
	{
		title: "오두막",
		description: "초록빛 기운과 함께 편안히 쉬는 숲속 풍경",
		background: "linear-gradient(135deg, #1f2f3f 0%, #32516a 100%)",
		backgroundPosition: "center",
		backgroundSize: "cover",
	},
	{
		title: "열차",
		description: "규칙적인 진동감으로 마음을 안정시키는 열차 풍경",
		background: "linear-gradient(135deg, #2a2f43 0%, #4b5678 100%)",
		backgroundPosition: "center",
		backgroundSize: "cover",
	},
];

let currentSceneIndex = 0;
let selectedWeather = "맑음";
let selectedTime = "아침";

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
	});
}

if (envToggle) {
	envToggle.addEventListener("click", () => {
		toggleEnvPanel();
	});
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
	});
}

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
