// User Interface
export interface UserInterface {
    id: string;
    username: string;
    email: string;
    password: string;
  }
  

export interface SignupInterface {
    username: string;
    email: string;
    password: string;
}
export interface LoginInterface {
    username: string;
    password: string;
}

​export interface updateUserInterface {
    id: string;
    username?: string;
    email?: string;
}
​
export interface deleteInterface {
    id: string;
}
​
export interface updatePasswordInterface {
    id: string;
    newPassword: string
}