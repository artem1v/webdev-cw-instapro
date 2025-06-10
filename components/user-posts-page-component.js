import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";
import * as ruLocale from "https://cdn.jsdelivr.net/npm/date-fns@3/locale/ru/+esm";
import { likePost } from "../api.js";
import { getToken } from "../index.js";

export function renderUserPostsPageComponent({ appEl, userId }) {
  // Проверяем, есть ли посты и первый пост
  if (!posts.length || !posts[0]?.user) {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <p class="error-text">Пользователь не найден или нет постов</p>
      </div>
    `;
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });
    return;
  }

  const user = posts[0].user;

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="posts-user-header">
        <img src="${user.imageUrl || "./assets/images/default-avatar.png"}" 
             class="posts-user-header__user-image">
        <p class="posts-user-header__user-name">${
          user.name || "Неизвестный пользователь"
        }</p>
      </div>
      <ul class="posts">
        ${posts
          .map(
            (post) => `
          <li class="post">
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
                Нравится: <strong>${post.likes?.length || 0}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${user.name}</span>
              ${post.description || ""}
            </p>
            <p class="post-date">
              ${
                post.createdAt
                  ? formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: ruLocale.default,
                    })
                  : "давно"
              }
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

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", () => {
      const postId = button.dataset.postId;
      const likeImg = button.querySelector("img");
      const likesCountEl = button.nextElementSibling.querySelector("strong");

      if (!user) {
        alert("Для оценки поста необходимо авторизоваться");
        goToPage(AUTH_PAGE);
        return;
      }

      // Визуальное изменение до ответа сервера (оптимистичное обновление)
      const isLiked = likeImg.src.includes("like-active.svg");
      const currentLikes = parseInt(likesCountEl.textContent);

      likeImg.src = isLiked
        ? "./assets/images/like-not-active.svg"
        : "./assets/images/like-active.svg";

      likesCountEl.textContent = isLiked ? currentLikes - 1 : currentLikes + 1;

      // Отправка запроса на сервер
      likePost({
        token: getToken(),
        postId: postId,
      }).catch((error) => {
        console.error("Ошибка при лайке:", error);
        // Откатываем изменения, если запрос не удался
        likeImg.src = isLiked
          ? "./assets/images/like-active.svg"
          : "./assets/images/like-not-active.svg";
        likesCountEl.textContent = currentLikes;
        alert("Не удалось поставить лайк. Попробуйте ещё раз.");
      });
    });
  });

}
