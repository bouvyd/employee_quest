export interface UserInfo {
    uid: number;
    name: string;
    username: string;
    companyId: number;
    departmendId: number;
}

export interface Company {
    id: number;
    name: string;
}

export interface Department {
    id: number;
    name: string;
}

export interface Employee {
    id: number;
    name: string;
    jobTitle: string;
    departmentName: string;
    departmentId: number;
    companyId: number;
    avatarUrl: string;
}