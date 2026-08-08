const startScreen = document.querySelector('[data-screen="start"]');
const sceneScreen = document.querySelector('[data-screen="scene"]');
const startButton = document.getElementById("start-button");
const sceneProgress = document.getElementById("scene-progress");
const sceneTitle = document.getElementById("scene-title");
const sceneDescription = document.getElementById("scene-description");
const sceneImagePlaceholder = document.getElementById("scene-image-placeholder");
const sceneArrows = document.querySelectorAll(".scene-arrow");

const scenes = [
	{
		title: "비 오는 밤에 다락방의 창문",
		description: "빗소리와 함께 조용히 머물 수 있는 다락방 풍경",
		gradient: "linear-gradient(135deg, #1b2a44 0%, #24395d 100%)",
	},
	{
		title: "카페 창가",
		description: "잔잔한 실내 소음 속에서 집중하기 좋은 창가 풍경",
		gradient: "linear-gradient(135deg, #2a364f 0%, #4a5c7d 100%)",
	},
	{
		title: "우주정거장의 창밖",
		description: "고요한 우주를 바라보며 호흡을 가다듬는 풍경",
		gradient: "linear-gradient(135deg, #16233d 0%, #2d406a 100%)",
	},
	{
		title: "조용한 숲속 안 오두막의 창문",
		description: "초록빛 기운과 함께 편안히 쉬는 숲속 풍경",
		gradient: "linear-gradient(135deg, #1f2f3f 0%, #32516a 100%)",
	},
	{
		title: "시끄럽지 않게 달리는 열차 침대칸의 창문",
		description: "규칙적인 진동감으로 마음을 안정시키는 열차 풍경",
		gradient: "linear-gradient(135deg, #2a2f43 0%, #4b5678 100%)",
	},
];

let currentSceneIndex = 0;

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
		sceneImagePlaceholder.style.background = currentScene.gradient;
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

for (const arrowButton of sceneArrows) {
	arrowButton.addEventListener("click", () => {
		const direction = arrowButton.dataset.direction;
		moveScene(direction === "next" ? "next" : "prev");
	});
}

renderSceneCard();

if (startButton && startScreen && sceneScreen) {
	startButton.addEventListener("click", () => {
		startScreen.classList.add("is-hidden");
		sceneScreen.classList.remove("is-hidden");
	});
}
