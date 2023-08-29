$(document).on("click", ".button-toggle", (event) => {
  const button = event.currentTarget;
  const group = $(button.closest(".button-group"));

  if (group.hasClass("show")) {
    group.toggleClass("show");
  } else {
    $(".button-group").removeClass("show");
    group.toggleClass("show");
  }
});

$(document).on("click", ".button-drop-item", (event) => {
  $(".button-group").removeClass("show");
});