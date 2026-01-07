// data/userStorage.js

let users = [
  { email: 'demo@example.com', password: '123456', accountType: 'member' },
  { email: 'admin@example.com', password: 'admin123', accountType: 'admin' },
];
let currentUser = null;

export const getUsers = () => users;
export const addUser = (user) => users.push(user);
export const emailExists = (email) => users.some(u => u.email === email);

export const setCurrentUser = (user) => { currentUser = user; };
export const getCurrentUser = () => currentUser;
