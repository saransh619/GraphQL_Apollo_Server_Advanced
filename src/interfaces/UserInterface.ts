export interface SignupInterface {
    username: string;
    email: string;
    password: string;
}

export interface LoginInterface {
    username: string;
    password: string;
}

export interface updateUserInterface {
    id: string;
    username?: string;
    email?: string;
}

export interface deleteInterface {
    id: string;
}

export interface updatePasswordInterface {
    id: string;
    newPassword: string
}

export interface createPostInterface {
    title: string;
    content: string;
}

export interface createCommentInterface{
    text: string; 
    postId: string;
}

export interface createReplyInterface{
    text: string; 
    commentId: string;
}
