
const express = require('express');
const route = express.Router()
const { cadastroUser } = require("../controller/cadastroUserController");
const main = require("../controller/main")

route.get("/",  (req, res) => {
    res.render("home/index")
})


route.get("/userSignup", (req,res)=>{
    res.render("user/cadastroUsuario",{
        title: "Cadastro",
        style: "cadastroUsuario.css",
        script: "cadastroUsuario.js"
    })
})

route.get("/userLogin", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css",
        script: "setErroMgs.js"
    })
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/userLogin")
})

route.get("/userLoginPerfil", (req,res)=>{

    res.redirect("/userLogin")
})

module.exports = route
