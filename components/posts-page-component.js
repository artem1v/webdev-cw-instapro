import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";
import * as ruLocale from "https://cdn.jsdelivr.net/npm/date-fns@3/locale/ru/+esm";
import { likePost } from "../api.js";
import { getToken, user } from "../index.js";
import { AUTH_PAGE } from "../routes.js";

export function renderPostsPageComponent({ appEl }) {
  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${posts
          .map(
            (post) => `
          <li class="post">
            <div class="post-header" data-user-id="${post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image">
              <p class="post-header__user-name">${post.user.name}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${post.id}" class="like-button">
                <img src="${
                  post.isLiked
                    ? "./assets/images/like-active.svg"
                    : "./assets/images/like-not-active.svg"
                }">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${post.likes.length}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${post.user.name}</span>
              ${post.description}
            </p>
            <p class="post-date">
              ${formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ruLocale.default,
              })}
            </p>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  document.querySelectorAll(".post-header").forEach((userEl) => {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", () => {
      // Проверка авторизации
      if (!user) {
        showAuthModal();
        return;
      }

      const postId = button.dataset.postId;
      const likeImg = button.querySelector("img");
      const likesCountEl = button.nextElementSibling.querySelector("strong");

      // Оптимистичное обновление
      const isLiked = likeImg.src.includes("like-active.svg");
      const currentLikes = parseInt(likesCountEl.textContent);

      likeImg.src = isLiked
        ? "./assets/images/like-not-active.svg"
        : "./assets/images/like-active.svg";
      likesCountEl.textContent = isLiked ? currentLikes - 1 : currentLikes + 1;

      // Отправка на сервер
      likePost({
        token: getToken(),
        postId: postId,
      }).catch((error) => {
        console.error("Ошибка:", error);
        // Откат изменений
        likeImg.src = isLiked
          ? "./assets/images/like-active.svg"
          : "./assets/images/like-not-active.svg";
        likesCountEl.textContent = currentLikes;
      });
    });
  });

  // Функция показа модального окна
  function showAuthModal() {
    const modalHtml = `
    <div class="auth-modal-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    ">
      <div class="auth-modal-content" style="
        background: white;
        padding: 25px;
        border-radius: 8px;
        text-align: center;
        max-width: 300px;
        width: 100%;
      ">
        <h3 style="margin-top: 0; margin-bottom: 20px;">Чтобы поставить лайк, пожалуйста, авторизуйтесь</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="auth-modal-login" class="button" style="width: 100%;">
            Войти
          </button>
          <button id="auth-modal-close" class="secondary-button" style="width: 100%;">
            Продолжить без входа
          </button>
        </div>
      </div>
    </div>
  `;

    const modal = document.createElement("div");
    modal.innerHTML = modalHtml;
    document.body.appendChild(modal);

    // Обработчик кнопки "Войти"
    modal.querySelector("#auth-modal-login").addEventListener("click", () => {
      document.body.removeChild(modal);

      // Сохраняем в localStorage, что переход был из модального окна
      localStorage.setItem("authRedirect", "true");

      // Делаем переход
      goToPage(AUTH_PAGE);
    });

    // Обработчик кнопки закрытия
    modal.querySelector("#auth-modal-close").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Закрытие по клику на оверлей
    modal
      .querySelector(".auth-modal-overlay")
      .addEventListener("click", (e) => {
        if (e.target === modal.querySelector(".auth-modal-overlay")) {
          document.body.removeChild(modal);
        }
      });
  }
}
