import {Student} from "./script.js";

export let url = 'http://localhost:8080/api/v1/student';

export function postStudent(student) {
    const data = JSON.stringify(student);

    console.log('Inside postStudent');
    console.log(data);
    console.log(student);
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorResponse => {
                return Promise.reject(errorResponse);
            });
        }
    }).then(data => {
        console.log('Success:', data);
        return data;
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        return Promise.reject(error);
    });
}

export function putStudent(student) {
    const data = JSON.stringify(student);
    console.log(data);

    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorResponse => {
                return Promise.reject(errorResponse);
            });
        }
    }).then(data => {
        console.log('Success:', data);
        return data;
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        return Promise.reject(error);
    });
}


export function delStudent(student) {
    const data = JSON.stringify({id: student.id});
    console.log(data);

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorResponse => {
                return Promise.reject(errorResponse);
            });
        }
    }).then(data => {
        console.log('Success:', data);
        return data;
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        return Promise.reject(error);
    });
}

export function getStudents(){
    return fetch(url, {
        method: 'GET'
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorResponse => {
                return Promise.reject(errorResponse);
            });
        }
    }).then(data => {
        console.log('Success:', data);
        return data.map(item => new Student(item.id, item.group, item.name, item.gender, item.birthday, item.status));
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        return Promise.reject(error);
    });
}