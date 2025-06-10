// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "prod";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export function getUserPosts({ token, userId }) {
  console.log("Запрос постов пользователя с ID:", userId); // Добавьте эту строку
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      console.log("Ответ сервера:", response); // И эту
      if (response.status === 404) {
        throw new Error("Пользователь не найден");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Полученные данные:", data); // И эту
      return data.posts || [];
    });
}

export function likePost({ token, postId }) {
  if (!token) {
    return Promise.reject(new Error("Требуется авторизация"));
  }

  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Необходимо авторизоваться");
    }
    return response.json();
  });
}

export function addPost({ token, description, imageUrl }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      description,
      imageUrl,
    }),
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.message || "Не удалось добавить пост");
      });
    }
    return response.json();
  });
}

export function updateUser({ token, imageUrl }) {
  return fetch(`${baseHost}/api/user`, {
    method: "PATCH",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  }).then((response) => {
    if (response.status === 401) throw new Error("Нет авторизации");
    if (!response.ok) throw new Error("Ошибка обновления");
    return response.json();
  });
}

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/upload-avatar`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
};

