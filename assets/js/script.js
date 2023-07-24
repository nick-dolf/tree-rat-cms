/**
 * Scroll Button function
 */
let scrollButtons = document.getElementsByClassName('scroll')
for (button of scrollButtons) {
  button.addEventListener('click', scrollToNextSection)
}

function scrollToNextSection(event) {
  const index = event.currentTarget.dataset.scroll
  const sections = document.getElementsByTagName('section')
  sections[index].scrollIntoView({behavior: "smooth"})
}


const header = document.querySelector(".site-header")

function menuToggle() {
  header.classList.toggle("menu-clicked")
  header.classList.remove("search-clicked")
}

function subMenuToggle(event) {
  event.currentTarget.parentNode.classList.toggle("sub-menu-clicked")
}

function searchToggle() {
  header.classList.toggle("search-clicked")
  header.classList.remove("menu-clicked")
}

const searchForm = document.querySelector(".form-search");
const searchInput = document.querySelector(".search__input");
function toggleSearchInput() {
  searchForm.classList.toggle("active")
  searchInput.focus()
}

