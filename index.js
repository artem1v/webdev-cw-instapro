import { getPosts, getUserPosts } from "./api.js"; // Импортируем обе функции
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import { renderUserPostsPageComponent } from "./components/user-posts-page-component.js"; // Добавьте этот импорт
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];
let data = null; // Для передачи данных между страницами

export const getToken = () => {
  return user ? `Bearer ${user.token}` : undefined;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

export const goToPage = (newPage, newData) => {
  const validPages = [
    POSTS_PAGE,
    USER_POSTS_PAGE,
    AUTH_PAGE,
    ADD_POSTS_PAGE,
    LOADING_PAGE,
  ];

  if (!validPages.includes(newPage)) {
    console.error("Попытка перехода на несуществующую страницу:", newPage);
    return goToPage(POSTS_PAGE);
  }

  data = newData || null;
  page = newPage;

  if (newPage === ADD_POSTS_PAGE && !user) {
    page = AUTH_PAGE;
    return renderApp();
  }

  if (newPage === POSTS_PAGE || newPage === USER_POSTS_PAGE) {
    const targetPage = newPage;
    page = LOADING_PAGE;
    renderApp();

    const apiCall =
      newPage === POSTS_PAGE
        ? getPosts({ token: getToken() })
        : getUserPosts({ token: getToken(), userId: data.userId });

    return apiCall
      .then((newPosts) => {
        posts = newPosts;
        page = targetPage;
        renderApp();
      })
      .catch((error) => {
        console.error(error);
        goToPage(POSTS_PAGE);
      });
  }

  if (newPage === USER_POSTS_PAGE) {
    if (!data?.userId) {
      console.error("Не указан ID пользователя");
      return goToPage(POSTS_PAGE);
    }

    page = LOADING_PAGE;
    renderApp();

    getUserPosts({ token: getToken(), userId: data.userId })
      .then((newPosts) => {
        if (!newPosts || !newPosts.length) {
          console.log("У пользователя нет постов, но страница будет показана");
          posts = [];
        } else {
          posts = newPosts;
        }
        page = USER_POSTS_PAGE;
        renderApp();
      })
      .catch((error) => {
        console.error("Ошибка загрузки:", error);
        posts = [];
        page = USER_POSTS_PAGE;
        renderApp();
      });
  }
};

const renderApp = () => {
  const appEl = document.getElementById("app");

  switch (page) {
    case LOADING_PAGE:
      return renderLoadingPageComponent({ appEl, user, goToPage });
    case AUTH_PAGE:
      return renderAuthPageComponent({
        appEl,
        setUser: (newUser) => {
          user = newUser;
          saveUserToLocalStorage(user);
          goToPage(POSTS_PAGE);
        },
        user,
        goToPage,
      });
    case ADD_POSTS_PAGE:
      return renderAddPostPageComponent({
        appEl,
        onAddPostClick({ description, imageUrl }) {
          addPost({
            token: getToken(),
            description,
            imageUrl,
          })
            .then(() => goToPage(POSTS_PAGE))
            .catch(console.error);
        },
      });
    case POSTS_PAGE:
      return renderPostsPageComponent({ appEl });
    case USER_POSTS_PAGE:
      return renderUserPostsPageComponent({
        appEl,
        userId: data?.userId,
      });
    default:
      console.error("Неизвестная страница:", page);
      goToPage(POSTS_PAGE);
  }
};

goToPage(POSTS_PAGE);
