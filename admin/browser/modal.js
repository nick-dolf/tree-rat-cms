/**
 * Change folder selected
 */
$(document).on("show.bs.modal", "#addPageModal", (event) => {
  const button = event.relatedTarget;
  const folder = button.getAttribute("data-cms");
  $('#addPageModalFolderSelect').val(folder);
});