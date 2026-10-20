export const VALID_USER = {
  username: process.env.ADMIN_USERNAME || "Admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

export const INVALID_USER = {
  username: "invalidUser",
  password: "invalidPassword",
};

export const INVALID_USERNAME_USER = {
  username: "test123",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

export const ADMIN_SEARCH_DATA = {
  searchUsername: "girirajt19",
};

