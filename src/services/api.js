const API_URL = "https://jsonplaceholder.typicode.com";

export async function getUsers() {

    const response = await fetch(`${API_URL}/users`);

    const data = await response.json();

    return data;

}