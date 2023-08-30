/**
 * Menus
 */
const header = document.querySelector(".site-header");

// Toggle Mobile Dropdown Menu
document.getElementById("menu-toggle").addEventListener("click", menuToggle);

function menuToggle() {
  header.classList.toggle("menu-clicked");
  header.classList.remove("search-clicked");
}

// Toggle Sub Menu Dropdowns
for (subMenuToggle of document.getElementsByClassName("sub-menu-toggle")) {
  console.log(subMenuToggle)
  subMenuToggle.addEventListener("click", toggleSubMenu);
}

function toggleSubMenu(event) {
  console.log('sub')
  event.currentTarget.parentNode.classList.toggle("sub-menu-clicked");
}

/**
 * Scroll Button function
 */
for (button of document.getElementsByClassName("scroll")) {
  button.addEventListener("click", scrollToNextSection);
}

function scrollToNextSection(event) {
  const index = event.currentTarget.dataset.scroll;
  const sections = document.getElementsByTagName("section");
  sections[index].scrollIntoView({ behavior: "smooth" });
}

/**
 * Search Toggles
 */
function searchToggle() {
  header.classList.toggle("search-clicked");
  header.classList.remove("menu-clicked");
}

const searchForm = document.querySelector(".form-search");
const searchInput = document.querySelector(".search__input");
function toggleSearchInput() {
  searchForm.classList.toggle("active");
  searchInput.focus();
}
