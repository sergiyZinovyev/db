export interface IUser {
    id?: number;
    regnum: number; 
    is_send?: string; 
    mail_list_id?: number; 
    date?: string;
    email: string;
    namepovne: string;
}

export interface IMailig {}

export interface IMessage {
    id?: number;
    subject?: string;
    message?: string;
    attachments?: string;
    body_files?: string;
    id_user?: number;
    date?: string
}

export interface Ifiles {
    filename: string; 
    path: string; 
    size: string; 
    href: string
}

export interface IMailingLists {
    id: number;
    name: string; 
    user_id: number;
    realname: string;
    date_end: string
}
