'use strict';

const slideWrapper = document.querySelector('[data-slide="wrapper"]');
const slideList = document.querySelector('[data-slide="list"]');
const navPreviousButton = document.querySelector(
  '[data-slide="nav-previous-button"]'
);
const navNextButton = document.querySelector('[data-slide="nav-next-button"]');
const controlsWapper = document.querySelector(
  '[data-slide="controls-wrapper"]'
);
let slideItems = document.querySelectorAll('[data-slide="item"]');
let controlButtons;
let slideInterval;

const state = {
  startingPoint: 0,
  savedPosition: 0,
  currentPoint: 0,
  movement: 0,
  currentSlideIndex: 0,
  autoPlay: true,
  timeInterval: 0,
};

//Mudar slides
function translateSlide({ position }) {
  state.savedPosition = position;
  slideList.style.transform = `translateX(${position}px)`;
}

function getCenterPosition({ index }) {
  const slideItem = slideItems[index];
  const slideWidth = slideItem.clientWidth;
  const windowWidth = document.body.clientWidth;
  const margin = (windowWidth - slideWidth) / 2;
  const position = margin - index * slideWidth;
  return position;
}

function setVisibleSlide({ index, animate }) {
  if (index === 0 || index === slideItems.length - 1) {
    index = state.currentSlideIndex;
  }
  const position = getCenterPosition({ index });
  state.currentSlideIndex = index;
  slideList.style.transition = animate === true ? 'transform 1s' : 'none';
  activeControlButton({ index });
  translateSlide({ position: position });
}

function nextSlide() {
  setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true });
}

function previousSlide() {
  setVisibleSlide({ index: state.currentSlideIndex - 1, animate: true });
}

function createControlButtons() {
  slideItems.forEach(function () {
    const controlButton = document.createElement('button');
    controlButton.classList.add('slide-control-button');
    controlButton.classList.add('fas');
    controlButton.classList.add('fa-circle');
    controlButton.dataset.slide = 'control-button';
    controlsWapper.append(controlButton);
  });
}

function activeControlButton({ index }) {
  const slideItem = slideItems[index];
  const dataIndex = Number(slideItem.dataset.index);
  const controlButton = controlButtons[dataIndex];
  controlButtons.forEach(function (controlButtonItem) {
    controlButtonItem.classList.remove('active');
  });
  if (controlButton) controlButton.classList.add('active');
}

function createSlideClone() {
  const firstSlide = slideItems[0].cloneNode(true);
  firstSlide.classList.add('slide-cloned');
  firstSlide.dataset.index = slideItems.length;

  const secundSlide = slideItems[1].cloneNode(true);
  secundSlide.classList.add('slide-cloned');
  secundSlide.dataset.index = slideItems.length + 1;

  const lastSlide = slideItems[slideItems.length - 1].cloneNode(true);
  lastSlide.classList.add('slide-cloned');
  lastSlide.dataset.index = -1;

  const penultimateSlide = slideItems[slideItems.length - 2].cloneNode(true);
  penultimateSlide.classList.add('slide-cloned');
  penultimateSlide.dataset.index = -2;

  //Criar no final da lista
  slideList.append(firstSlide);
  slideList.append(secundSlide);
  //Criar no início da lista
  slideList.prepend(lastSlide);
  slideList.prepend(penultimateSlide);

  slideItems = document.querySelectorAll('[data-slide="item"]');
}

//Apertar
function onMouseDown(event, index) {
  const slideItem = event.currentTarget;
  state.startingPoint = event.clientX;
  state.currentPoint = state.startingPoint - state.savedPosition;
  state.currentSlideIndex = index;
  slideList.style.transition = 'none';
  slideItem.addEventListener('mousemove', onMouseMove);
}
//Evento de mover mouse
function onMouseMove(event, index) {
  state.movement = event.clientX - state.startingPoint;
  const position = event.clientX - state.currentPoint;
  translateSlide({ position });
}
//Soltar
function noMouseUp(event) {
  const pointsToMove = event.type.includes('touch') ? 50 : 150;
  // console.log(event.type);
  const slideItem = event.currentTarget;
  if (state.movement < -pointsToMove) {
    nextSlide();
  } else if (state.movement > pointsToMove) {
    previousSlide();
  } else {
    setVisibleSlide({ index: state.currentSlideIndex, animate: true });
  }

  slideItem.removeEventListener('mousemove', onMouseMove);
}

function onTouchStart(event, index) {
  event.clientX = event.touches[0].clientX;
  onMouseDown(event, index);
  const slideItem = event.currentTarget;
  slideItem.addEventListener('touchmove', onTouchMove);
}

function onTouchMove(event) {
  event.clientX = event.touches[0].clientX;
  onMouseMove(event);
}
function onTouchEnd(event) {
  noMouseUp(event);
  const slideItem = event.currentTarget;
  slideItem.removeEventListener('touchmove', onTouchMove);
}

function onControlButtonClick(index) {
  setVisibleSlide({ index: index + 2, animate: true });
}

function onSlideListTransitionEnd() {
  const slideItem = slideItems[state.currentSlideIndex];

  if (
    slideItem.classList.contains('slide-cloned') &&
    Number(slideItem.dataset.index) > 0
  ) {
    setVisibleSlide({ index: 2, animate: false });
  }
  if (
    slideItem.classList.contains('slide-cloned') &&
    Number(slideItem.dataset.index) < 0
  ) {
    setVisibleSlide({ index: slideItems.length - 3, animate: false });
  }
}

function setAutoPlay() {
  if (state.autoPlay) {
    slideInterval = setInterval(function () {
      setVisibleSlide({ index: state.currentSlideIndex + 1, animate: true });
    }, state.timeInterval);
  }
}

function setListeners() {
  controlButtons = document.querySelectorAll('[data-slide="control-button"]');
  slideItems = document.querySelectorAll('[data-slide="item"]');

  //Adicionar evento nos indicatons
  controlButtons.forEach(function (controlButton, index) {
    controlButton.addEventListener('click', function (event) {
      onControlButtonClick(index);
    });
  });

  //Eventos do mouse
  slideItems.forEach(function (slideItem, index) {
    //Arrastar
    slideItem.addEventListener('dragstart', function (event) {
      event.preventDefault();
    });
    //Apertar
    slideItem.addEventListener('mousedown', function (event) {
      onMouseDown(event, index);
    }),
      //Soltar no mobile
      slideItem.addEventListener('mouseup', noMouseUp);

    //Apertar no mobile
    slideItem.addEventListener('touchstart', function (event) {
      onTouchStart(event, index);
    }),
      //Soltar
      slideItem.addEventListener('touchend', onTouchEnd);
  });

  navNextButton.addEventListener('click', nextSlide);
  navPreviousButton.addEventListener('click', previousSlide);
  //Evento para voltar o slide de forma que o usuário não perceba
  slideList.addEventListener('transitionend', onSlideListTransitionEnd);
  slideWrapper.addEventListener('mouseenter', function () {
    clearInterval(slideInterval);
  });
  slideWrapper.addEventListener('mouseleave', function () {
    setAutoPlay();
  });
  //Manter posicionamento padrão
  let resizeTimeOut;
  window.addEventListener('resize', function () {
    this.clearTimeout(resizeTimeOut);
    resizeTimeOut = setTimeout(function () {
      setVisibleSlide({ index: state.currentSlideIndex, animate: true });
    }, 1000);
  });
}

function initSlider({
  startAtIndex = 0,
  autoPlay = true,
  timeInterval = 3000,
}) {
  state.autoPlay = autoPlay;
  state.timeInterval = timeInterval;
  createControlButtons();
  createSlideClone();
  setListeners();
  setVisibleSlide({ index: startAtIndex + 2, animate: true });
  setAutoPlay();
}

//Pegar clicks na página
// document.addEventListener('click', (event) => {
//   const elementClicked = event.target;
//   console.log(elementClicked);
// });

//Parei em 3h49m59s do vídeo
//https://www.youtube.com/watch?v=eUwqZrgASM0
