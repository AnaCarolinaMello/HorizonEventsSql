let chk = document.querySelector("#showPassword")
chk.addEventListener('change', changeVisibilitySenha)

function changeVisibilitySenha() {
    let password = document.querySelector("#senha")
    let password2 = document.querySelector("#confirme_senha")
    if(password.type === "password" || password2.type === "password"){
        password.type = "text"
        password2.type = "text"
    }else{
        password.type = "password"
        password2.type = "password"
    }
}