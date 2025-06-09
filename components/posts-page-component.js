import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";
import * as ruLocale from "https://cdn.jsdelivr.net/npm/date-fns@3/locale/ru/+esm";
import { likePost } from "../api.js";
import { getToken } from "../index.js";

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

  document.querySelectorAll(".post-header").forEach((userEl) => {
  userEl.addEventListener("click", () => {
    const userId = userEl.dataset.userId;
    console.log("Переход на страницу пользователя с ID:", userId); // Добавьте эту строку
    goToPage(USER_POSTS_PAGE, {
      userId: userId
    });
  });
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
      postId: postId
    })
    .catch((error) => {
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
