import { Company, Department, UserInfo, Employee } from "../interfaces/odoo";

const userInfo = async () => {
    const sessionInfoRequest = await fetch('https://www.odoo.com/web/session/get_session_info',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }
    );
    const session_info = await sessionInfoRequest.json();
    console.log(session_info);
    if (session_info.error) {
        throw new Error(session_info.error.message);
    }
    const employeeRequest = await fetch('https://www.odoo.com/web/dataset/call_kw/hr.employee.public/read',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'hr.employee.public',
                    method: 'search_read',
                    args: [[['user_id', '=', session_info.result.uid]]],
                    kwargs: {
                        fields: ['name', 'company_id', 'department_id'],
                    },
                }
            }),
        }
    );
    const employeeInfo = await employeeRequest.json();
    const hasEmployee = employeeInfo.result.length > 0;
    if (!hasEmployee) {
        throw new Error('No employee found for this user');
    }
    const departmentRequest = await fetch('https://www.odoo.com/web/dataset/call_kw/hr.department/read',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'hr.department',
                    method: 'search_read',
                    args: [[['id', '=', employeeInfo.result[0].department_id[0]]]],
                    kwargs: {
                        fields: ['parent_path'],
                    },
                }
            }),
        }
    );
    const departmentInfo = await departmentRequest.json();
    const parentDepartmentId = departmentInfo.result[0].parent_path.split('/')[0];
    const user: UserInfo = {
        uid: parseInt(session_info.result.uid),
        name: session_info.result.name,
        username: session_info.result.username,
        companyId: parseInt(employeeInfo.result[0].company_id[0]),
        departmendId: parseInt(parentDepartmentId),
    }
    console.log(user);
    return user;
}

const getCompanies = async () => {
    const res = await fetch('https://www.odoo.com/web/dataset/call_kw/res.company/search_read',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'res.company',
                    method: 'search_read',
                    args: [[]],
                    kwargs: {
                        fields: ['name'],
                    },
                }
            }),
        }
    );
    const content = await res.json();
    console.log(content);
    if (content.error) {
        throw new Error(content.error.message);
    }
    return content.result as Company[];
}

const getDepartments = async () => {
    const res = await fetch('https://www.odoo.com/web/dataset/call_kw/hr.department/search_read',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'hr.department',
                    method: 'search_read',
                    args: [[['parent_id', '=', false]]],
                    kwargs: {
                        fields: ['name'],
                    },
                }
            }),
        }
    );
    const content = await res.json();
    console.log(content);
    if (content.error) {
        throw new Error(content.error.message);
    }
    return content.result as Department[];
}

const getEmployees = async ({ queryKey }: { queryKey: [string, number, number, number?] }) => {
    const formatEmployee = (employee: any):Employee => {
        return {
            id: employee.id,
            name: employee.name,
            jobTitle: employee.job_title,
            departmentName: employee.department_id[1],
            departmentId: employee.department_id[0],
            companyId: employee.company_id[0],
            avatarUrl: `https://www.odoo.com/web/image/hr.employee.public/${employee.id}/avatar_128`,
        }
    };
    const companyId = queryKey[1];
    const departmendId = queryKey[2];
    let numEmployees = queryKey[3] ?? 10;
    const res = await fetch('https://www.odoo.com/web/dataset/call_kw/hr.employee.public/search_read',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                jsonrpc: '2.0',
                method: 'call_kw',
                params: {
                    model: 'hr.employee.public',
                    method: 'search_read',
                    args: [],
                    kwargs: {
                        domain: [['company_id', 'in', [companyId]], ['department_id', 'child_of', departmendId], ['image_128', '!=', false]],
                        fields: ['name', 'user_id', 'department_id', 'company_id', 'job_title'],
                    },
                }
            }),
        }
    );
    const content = await res.json();
    // extract numEmployees random employees, if there are enough
    const employees = content.result;
    let result: Employee[]
    if (employees.length >= numEmployees) {
        const randomEmployees = [];
        for (let i = 0; i < numEmployees; i++) {
            const randomIndex = Math.floor(Math.random() * employees.length);
            randomEmployees.push(employees[randomIndex]);
            employees.splice(randomIndex, 1);
        }
        result = randomEmployees.map(formatEmployee);
    } else {
        result = employees.map(formatEmployee);
    }
    // shuffle the order
    result.sort(() => Math.random() - 0.5);
    return result;
}



export { userInfo, getCompanies, getDepartments, getEmployees }