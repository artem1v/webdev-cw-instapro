import { renderUploadImageComponent } from "./upload-image-component.js";
import { uploadImage, addPost } from "../api.js";
import { goToPage } from "../index.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <div class="upload-image-container"></div>
            <textarea id="description-input" class="textarea" placeholder="Описание"></textarea>
            <div class="form-error"></div>
            <button class="button" id="add-button">Добавить</button>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document.getElementById("description-input").value.trim();

      if (!description) {
        alert("Введите описание");
        return;
      }

      if (!imageUrl) {
        alert("Загрузите изображение");
        return;
      }

      onAddPostClick({ description, imageUrl });
    });
  };

  render();
}
