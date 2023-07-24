/*
/ Image Input Preview
*/
$("#image-input").on("change", (event) => {
  const images = event.target.files;
  let gallery = $("#input-gallery");
  gallery.html("");

  if (images) {
    for (var i = 0; i < images.length; i++) {
      let reader = new FileReader();
      reader.onload = (event) => {
        let image = $("<img class=m-2 height=100/>").attr("src", event.target.result);
        gallery.append(image);
      };

      reader.readAsDataURL(images[i]);
    }
  }
});

/*
/ Image API
*/

// Image Submit (POST)
$("#image-submit").click((event) => {
  output("Uploading image(s)");
  const button = event.currentTarget;

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  const formData = new FormData(document.getElementById("image-form"));

  $.ajax({
    url: "",
    type: "POST",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Images Uploaded");
      console.log("update success", response);
      $("#image-gallery-anchor").prepend(response);
      initSortable();
    })
    .fail((response) => {
      output("Failed to upload images", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $("#input-gallery").html("");
      $("#image-form").trigger("reset");
    });
});

// Image Delete (DELETE)
$(document).on("click", ".image-delete", (event) => {
  const button = event.currentTarget;
  console.log(button.lastChild);
  const deleteImage = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deleteImage}?`)) {
    output(`sending delete request to server: ${deleteImage}`);

    button.querySelector(".spinner-border").classList.remove("d-none");
    button.disabled = true;

    $.ajax({ url: `images/${deleteImage}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log("delete success", response);
        button.closest(".image-card").remove();
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

/*
/ Image Select
*/
let activeImage;

$(document).on("click", ".image-set-active", (event) => {
  activeImage = event.currentTarget;
  console.log(activeImage);
});

$(".image-change").click((event) => {
  const button = event.currentTarget;

  $(activeImage).children("input").attr("value", button.dataset.cmsImage);
  $(activeImage)
    .children("img")
    .attr("src", button.dataset.cmsFolder + "thumb/" + button.dataset.cmsImage);
});
