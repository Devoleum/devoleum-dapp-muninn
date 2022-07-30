import { Component } from "solid-js";
interface IProps {
  onComplete: (res: boolean) => void;
}

const Login: Component<IProps> = (props) => {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username.value,
          password: password.value,
        }),
      }
    );
    let data = await response.json();
    localStorage.setItem("userInfo", JSON.stringify(data));
    props.onComplete(response.status === 200);
  };

  return (
    <div class="row">
      <div class="six columns">
        <h4>Login</h4>
        <form onSubmit={handleSubmit}>
          <div class="row">
            <label html-for="username">Username</label>
            <input class="input" type="text" placeholder="" id="username" />
          </div>
          <div class="row">
            <label html-for="password">Password</label>
            <input class="input" type="password" placeholder="" id="password" />
          </div>
          <input class="button" type="submit" id="login" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default Login;
