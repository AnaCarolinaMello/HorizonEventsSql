let chk = document.querySelector("#showPassword")
chk.addEventListener('change', changeVisibilitySenha)

function changeVisibilitySenha() {
    let passwordField = document.getElementById("senha")
    let senha2 = document.getElementById('senha2')
    let confirmPasswordField = document.getElementById('confirme_senha')
    if(passwordField.type === "password" || confirmPasswordField.type === "password" || senha2.type == "password"){
        passwordField.type = "text"
        senha2.type = "text"
        confirmPasswordField.type = "text"
    }else{
        passwordField.type = "password"
        senha2.type = "password"
        confirmPasswordField.type = "password"
    }
}
let cadastrado = document.querySelector("#confirm")
cadastrado.addEventListener('click',timer)

function timer(){
    setTimeout(()=>{
        document.getElementById("erro").style.display = "none"
        console.log("funciona")
    },5000)
}
