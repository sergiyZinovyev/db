export interface IUser {
    id?: number;
    regnum: number; 
    is_send?: string; 
    mail_list_id?: number; 
    date?: string;
    email: string;
    namepovne: string;
    sending?: number
}

//export interface IMailig {}   

export interface IMessage {
    id: number | string;
    subject: string;
    message: string;
    attachments: string;
    body_files: string;
    id_user: number;
    date: string;
    changed?: boolean;
    to: string;
    sendList: IUser[];
    from: string;
    mailingStatus?: 'sent'|'no_sent'|'sending';
    mailingId?: number
}

export interface IMessageInfo {
    id: number;
    subject: string;
    id_user: number;
    realename: string;
    date: string
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
    realname?: string;
    message_id?: number;
    sender?: string;
    is_sent?: string;
    date_start?: string;
    date_end: string
}

export interface IEvent{
    type;
    statusText?;
    body?;
    headers?;
    ok?;
    status?;
    url?;
}
