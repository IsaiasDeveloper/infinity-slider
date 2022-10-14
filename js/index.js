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
const slideItems = document.querySelectorAll('[data-slide="item"]');

const state = {
  startingPoint: 0,
  savedPosition: 0,
  currentPoint: 0,
  movement: 0,
  currentSlideIndex: 0,
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

function setVisibleSlide({ index }) {
  const position = getCenterPosition({ index });
  state.currentSlideIndex = index;
  translateSlide({ position: position });
}

function nextSlide() {
  setVisibleSlide({ index: state.currentSlideIndex + 1 });
}

function previousSlide() {
  setVisibleSlide({ index: state.currentSlideIndex - 1 });
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
//Apertar
function onMouseDown(event, index) {
  const slideItem = event.currentTarget;
  state.startingPoint = event.clientX;
  state.currentPoint = state.startingPoint - state.savedPosition;
  state.currentSlideIndex = index;
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
  const slideItem = event.currentTarget;
  const slideWidth = slideItem.clientWidth;
  if (state.movement < -150) {
    nextSlide();
  } else if (state.movement > 150) {
    previousSlide();
  } else {
    setVisibleSlide({ index: state.currentSlideIndex });
  }

  slideItem.removeEventListener('mousemove', onMouseMove);
}

function onControlButtonClick(event, index, controlButtons) {
  const controlButton = event.currentTarget;
  controlButtons.forEach(function (controlButtonItem) {
    controlButtonItem.classList.remove('active');
  });
  controlButton.classList.add('active');
  setVisibleSlide({ index: index });
  console.log('clicou');
}

function setListeners() {
  const controlButtons = document.querySelectorAll(
    '[data-slide="control-button]'
  );
  console.log(controlButtons);
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
      //Soltar
      slideItem.addEventListener('mouseup', noMouseUp);
  });

  navNextButton.addEventListener('click', nextSlide);
  navPreviousButton.addEventListener('click', previousSlide);
}

function initSlider() {
  createControlButtons();
  setListeners();
  setVisibleSlide({ index: 0 });
}
initSlider();

//Pegar clicks na página
// document.addEventListener('click', (event) => {
//   const elementClicked = event.target;
//   console.log(elementClicked);
// });
