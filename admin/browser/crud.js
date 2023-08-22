/**
 * CRUD
 */

// Create (POST)
$(document).on("click", ".create", (event) => {
  const button = event.currentTarget;
  const form = $(`#${button.dataset.cmsForm}`);
  const postData = form.serialize();

  output(`${button.dataset.cmsText}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.post(`${button.dataset.cmsUrl}`, postData)
    .done((response) => {
      output("Success");
      $(`#${button.dataset.cmsAnchor}`).html(response);
    })
    .fail((response) => {
      output("Fail: " + response.responseText, true);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
    });
});

// Update (PUT)
$(document).on("click", ".update", (event) => {
  const button = event.currentTarget;
  const putData = new FormData(document.getElementById(`${button.dataset.cmsForm}`));

  output(`${button.dataset.cmsText}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.ajax({
    url: "",
    type: "PUT",
    data: putData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Success");
      $(`#${button.dataset.cmsAnchor}`).html(response);
      $(".toggle").trigger("change");
      initSortable();
      reloadPreview();
    })
    .fail((response) => {
      output("Failed to save draft", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
    });
});

// Delete (DELETE)
$(document).on("click", ".delete", (event) => {
  const button = event.currentTarget;
  const deleteTarget = button.dataset.cms;

  if (confirm(`${button.dataset.cmsText} ${deleteTarget}?`)) {
    output(`sending delete request to server: ${deleteTarget}`);
    button.querySelector(".spinner-border").classList.remove("d-none");
    button.disabled = true;

    $.ajax({ url: `${button.dataset.cmsUrl}/${deleteTarget}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        $(`#${button.dataset.cmsAnchor}`).html(response);
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
      })
      .always(() => {
        button.querySelector(".spinner-border").classList.add("d-none");
        button.disabled = false;
      });
  }
});