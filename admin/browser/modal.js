/**
 * Change folder selected
 */
$(document).on("show.bs.modal", "#addPageModal", (event) => {
  const button = event.relatedTarget;
  const folder = button.getAttribute("data-cms");
  $('#addPageModalFolderSelect').val(folder);
});

/**
 * Change Image Edit
 */
$(document).on("show.bs.modal", "#imageEditModal", (event) => {
  const button = event.relatedTarget;
  const image = button.getAttribute("data-cms");
  $('#imageEdit').attr("src", image);
});