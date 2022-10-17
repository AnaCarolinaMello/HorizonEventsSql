
const express = require('express');
const route = express.Router()

route.get("/",  (req, res) => {
    res.render("home/index")
})


route.get("/user/Signup", (req,res)=>{
    res.render("user/cadastroUsuario",{
        title: "Cadastro",
        style: "cadastroUsuario.css",
        script: "userSignup.js"
    })
})

route.get("/user/Login", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css",
        script: "userLogin.js"
    })
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/user/Login")
})


route.get("/business/Signup", (req,res)=>{
    res.render("business/businessSignup",{
        title: "Entrar",
        style: "cadastroEmpresa.css",
        script: "businessSignup.js"
    })
})

module.exports = route
