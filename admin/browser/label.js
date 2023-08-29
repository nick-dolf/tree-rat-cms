/*
/ Label Sections and block
*/
let activeLabel;

$(document).on("click", ".label-set-active", (event) => {
  activeLabel = event.currentTarget;
});

$(".label-change").click((event) => {
  const label = $("#add-label-input").val();

  $(activeLabel)
    .closest(".roller")
    .find("input[name*=label]")
    .first()
    .val(label);
  $(activeLabel)
    .closest(".roller")
    .find(".accordion-label")
    .first()
    .html("&nbsp;- " + label);
});
