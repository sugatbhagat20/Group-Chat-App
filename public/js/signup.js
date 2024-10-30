var form = document.getElementById("signupForm");
form.addEventListener("submit", signUp);

async function signUp(e) {
  e.preventDefault();
  const user = {
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    password: document.querySelector("#password").value,
    number: document.querySelector("#phone").value,
  };
  try {
    let res;
    res = await axios.post("http://localhost:4000/user/signup", user);
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}
