import { renderUploadImageComponent } from "./upload-image-component.js";
import { uploadImage, addPost } from "../api.js";
import { goToPage, getToken } from "../index.js";
import { POSTS_PAGE } from "../routes.js";

export function renderAddPostPageComponent({ appEl }) {
  let imageUrl = "";
  let imageFile = null;

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <div class="upload-image-container"></div>
            <textarea id="description-input" class="textarea" placeholder="Описание"></textarea>
            <div id="description-error" class="form-error hidden">Добавьте описание</div>
            <div id="image-error" class="form-error hidden">Загрузите изображение</div>
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
        if (newImageUrl) {
          document.getElementById("image-error").classList.add("hidden");
        }
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document
        .getElementById("description-input")
        .value.trim();
      const descriptionError = document.getElementById("description-error");
      const imageError = document.getElementById("image-error");
      let isValid = true;

      document
        .getElementById("description-input")
        .addEventListener("input", (e) => {
          if (e.target.value.trim()) {
            document
              .getElementById("description-error")
              .classList.add("hidden");
            e.target.classList.remove("input-error");
          }
        });

      document
        .querySelector(".upload-image-container")
        .addEventListener("change", () => {
          document.getElementById("image-error").classList.add("hidden");
        });

      // Валидация описания
      if (!description) {
        descriptionError.classList.remove("hidden");
        isValid = false;
      } else {
        descriptionError.classList.add("hidden");
      }

      // Валидация изображения
      if (!imageUrl) {
        imageError.classList.remove("hidden");
        isValid = false;
      } else {
        imageError.classList.add("hidden");
      }

      if (!isValid) return;

      // Показываем лоадер
      const button = document.getElementById("add-button");
      button.disabled = true;
      button.textContent = "Добавляем...";

      addPost({
        token: getToken(),
        description,
        imageUrl,
      })
        .then(() => {
          goToPage(POSTS_PAGE);
        })
        .catch((error) => {
          console.error("Ошибка добавления поста:", error);
          alert(`Ошибка: ${error.message}`);
        })
        .finally(() => {
          button.disabled = false;
          button.textContent = "Добавить";
        });
    });
  };

  render();
}
