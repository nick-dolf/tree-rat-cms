// File Submit (POST)
$("#file-submit").click((event) => {
  output("Uploading file(s)");
  const button = event.currentTarget;

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  const formData = new FormData(document.getElementById("file-form"));

  $.ajax({
    url: "",
    type: "POST",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Files Uploaded");
      console.log("update success", response);
      $("#file-gallery-anchor").prepend(response);
      initSortable();
    })
    .fail((response) => {
      output("Failed to upload files", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $("#file-form").trigger("reset");
    });
});

// File Delete (DELETE)
$(document).on("click", ".file-delete", (event) => {
  const button = event.currentTarget;
  console.log(button.lastChild);
  const deleteFile = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deleteFile}?`)) {
    output(`sending delete request to server: ${deleteFile}`);

    button.querySelector(".spinner-border").classList.remove("d-none");
    button.disabled = true;

    $.ajax({ url: `files/${deleteFile}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log("delete success", response);
        button.closest(".file-row").remove();
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
        console.log("delete failed:", response.responseText);
      })
      .always(() => {
        button.querySelector(".spinner-border").classList.add("d-none");
        button.disabled = false;
      });
  }
});