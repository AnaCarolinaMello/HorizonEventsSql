
const express = require('express');
const route = express.Router()
const { cadastroUser } = require("../controller/cadastroUserController");
const business = require("../controller/buniness")

route.get("/",  (req, res) => {
    res.render("home/index")
})


route.get("/userSignup", (req,res)=>{
    res.render("user/cadastroUsuario",{
        title: "Cadastro",
        style: "cadastroUsuario.css",
        script: "userSignup.js"
    })
})

route.get("/userLogin", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css",
        script: "userLogin.js"
    })
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/userLogin")
})

route.get("/userLoginPerfil", (req,res)=>{

    res.redirect("/userLogin")
})

route.get("/business/Signup", (req,res)=>{
    res.render("business/businessPerfil",{
        title: "Entrar",
        style: "cadastroEmpresa.css",
        script: "businessSignup.js"
    })
})

module.exports = route
