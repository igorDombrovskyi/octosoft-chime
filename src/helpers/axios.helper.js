import axios from "axios";

const chimeAxios = axios.create({
  baseURL: "https://octodoc-chime.herokuapp.com/api/",
});

export { chimeAxios };
