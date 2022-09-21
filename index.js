const mysql = require("mysql");
const express = require('express');
const app = express()
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const http = require('http')
const port = 3000;
const route = require("./routes/route")
const mongoose = require('mongoose')
const handlebars = require("handlebars");
const session = require('express-session')
const flash = require('connect-flash')
const formidable = require('formidable')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const passport = require('passport')
require("./config/auth")(passport)
const multer = require('multer');
require('dotenv/config');
const localStorage = require('localStorage');
const { encode, decode } = require("punycode");
const cookieParser = require("cookie-parser");
const oneDay = 1000 * 60 * 60 * 24
var sessao;
// const sessionStorage = require('sto')

app.use("/",route)

app.engine('handlebars',engine());
app.set('view engine', 'handlebars');
// handlebars.registerPartial('_msg','.handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('/public'))

//Middleware que é usado para manter o usuário logado
app.use(session({
    secret: "Algo",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: true,
    rolling: true
}))

app.use(cookieParser());

// //Inicianização do passport para autentificação
// app.use(passport.initialize())
// //Inicianização do passport para uma sessão
// app.use(passport.session())

//Inicianização do flash
app.use(flash()) 

// Criação de variáveis globais para serem usadas no flash
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_mgs")
    res.locals.error_msg = req.flash("error_mgs")
    next();
}) 

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "HorizonEvents"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Conectado");
  });


var storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(__dirname, '/public/img/'))
    },
    filename: (req,file,cd)=>{
        cd(null,file.originalname)
    }
})
var upload = multer({storage: storage})

app.listen(port, err =>{
    console.log(`http://localhost:${port}`)
});

// //Requisição do arquivo com modelo da collection
// require("./models/User")
// //Passando para uma variável o modelo da collection
// const User_Cliente = mongoose.model("Usuario_Cliente")

app.post("/userPerfil", async (req,res)=>{

    // Array para mensagens de erros
    var erros = []
    // Variável para verificação de email
    var arroba = "@"
    // Variável para verificação de email
    var com = ".com"

    //Verificação se a variável é vazia
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome inválido"})
    }

    //Verificação se a variável é vazia
    if(!req.body.username || typeof req.body.username == undefined || req.body.username == null){
        erros.push({texto:"Nome de usuário inválido"})
    }

    //Verificação se a variável é vazia
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto:"Email inválido"})
    }

    //Verificação se a variável contém tais caracteres
    if (!req.body.email.toLowerCase().includes(arroba.toLowerCase()) || !req.body.email.toLowerCase().includes(com.toLowerCase())) {
        erros.push({texto:'Email inválido'})
    }

    //Verificação se a variável é vazia
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto:"Senha inválida"})

    //Verificação se a variável tem menos de 32 caracteres
    }else if(req.body.senha.length > 32){
        erros.push({texto:"Senha precisa conter menos de 32 caracteres"})

    //Verificação se a variável tem mais de 8 caractere
    }else if(req.body.senha.length < 8){
        erros.push({texto:"Senha precisa conter, no mínimo, 8 caracteres"})
    }

    //Verificação se a variável é vazia
    if(!req.body.confirme_senha || typeof req.body.confirme_senha == undefined || req.body.confirme_senha == null){
        erros.push({texto:"Senha de confirmação inválida"})

    //Verificação se a senha e sua confirmação batem
    }else if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }

    //Verificando se existem erros
    if(erros.length == 0){
        var email = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.email}'`
        var username = `SELECT* FROM Usuario_Cliente WHERE User_Name='${req.body.email}'`
        console.log(email)
        con.query(email, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            if(result == []){
                con.query(username, function (err, result, fields) {
                    if (err) throw err;
                    console.log(result);
                    if(result == []){
                        erros.push({texto:"Email e nome de usuário já cadastrados"})
                        res.render("user/cadastroUsuario",{
                        title: "Cadastro",
                        style: "cadastrousuario.css",
                        erros: erros})
                    }else{
                        erros.push({texto:"Email já cadastrado"})
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros
                        })
                    }
                });
            }else{
                con.query(username, function (err, result, fields) {
                    if (err) throw err;
                    console.log(result);
                    if(result == []){
                        erros.push({texto:"Nome de usuário já cadastrado"})
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros
                        })
                    }else{
                        let senha = req.body.senha
                        var sql = `INSERT INTO Usuario_Cliente (Nome, User_Name,Email,Telefone,Foto_Perfil,Senha) VALUES ('${req.body.nome}','${req.body.username}','${req.body.email}','${req.body.telefone}','/img/profile.jpg','${senha}')`;
                        localStorage.setItem('userEmail',req.body.email)
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("Usuário adicionado com sucesso");
                            res.render("user/areaDoUsuario",{
                                title: req.body.username,
                                style: "areaDoUsuario.css",
                                email: req.body.email,
                                usuario: req.body.username,
                                fotoPerfil: '/img/profile.jpg' 
                            })
                        });
                    }
                  });
                }
          });
        
        
    }else{
        res.render("user/cadastroUsuario",{
            title: "Cadastro",
            style: "cadastrousuario.css",
            erros: erros
        })
    }
//     con.query(email, function (err, result) {
//         if (err) throw err;
//         idExibir = result[0].Id
//       });
})

// //Tentativa de dar um upload em imagens no banco de dados
app.post("/upload/:id", upload.single('foto'), async(req,res,result)=>{
    var id = req.params.id
    var user = `UPDATE Usuario_Cliente SET Foto_Perfil= '/img/${req.file.originalname}' WHERE Id='${id}'`
    con.query(user, function (err, result) {
        if (err) throw err;
        console.log(result);
        if(result == []){
            console.log("Erro ao salvar imagem")
            res.redirect("/userPerfilImagem")
        }else{
            imagemExibir = `/img/${req.file.originalname}`
            console.log("Imagem salva com sucesso")
            res.redirect("/userPerfilImagem")
        }
      });
})

app.get("/userPerfilImagem", async (req,res)=>{
    let erros = []
    let email = localStorage.getItem('userEmail')
      console.log(email)
    if(email != null){
    let user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    con.query(user, function (err, result) {
        console.log(result)
        if (err) throw err;
        res.render("user/areaDoUsuario",{
            title: result[0].User_Name,
            style: "areaDoUsuario.css",
            email: email,
            usuario: result[0].User_Name,
            _id: result[0].Id,
            fotoPerfil:  result[0].Foto_Perfil
        })
    })
    }else{
        erros.push({texto:"Erro, entre novamente mais tarde"})
        res.render("user/loginUsuario",{
            title: "Entrar",
            style: "loginUsuario.css",
            erros: erros
        })
    }
})

// //Rota de autentificação do login
app.post("/userLoginPerfil", async(req,res,next)=>{
    var erros = []
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.email}'`
    con.query(user, function (err, result, fields) {
        if(result.length > 0){
            localStorage.setItem('userEmail',req.body.email)
            let conferirSenha = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.email}' AND Senha='${req.body.senha}'`
            con.query(conferirSenha, function (err, result, fields) {
                if(result.length>0){
                    res.render("user/areaDoUsuario",{
                        title: result[0].User_Name,
                        style: "areaDoUsuario.css",
                        email: result[0].Email,
                        usuario: result[0].User_Name,
                        _id: result[0].Id,
                        fotoPerfil:  result[0].Foto_Perfil
                    })
                
                }else{
                    erros.push({texto:"Senha incorreta"})
                    res.render("user/loginUsuario",{
                        title: "Entrar",
                        style: "loginUsuario.css",
                        erros: erros
                    })
                }
            })
        }else{
            erros.push({texto:"Essa conta não existe"})
            res.render("user/loginUsuario",{
                title: "Entrar",
                style: "loginUsuario.css",
                erros: erros
            })
        }
      });
    
})

app.get("/userEdit", async(req,res)=>{

    let email = localStorage.getItem('userEmail')
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    con.query(user, function (err, result) {
        if (err) throw err;
        let telefone
        if(result[0].Telefone == undefined){
            telefone = ""
        }else{
            telefone = result[0].Telefone
        }
        res.render("user/editarUsuario",{
            title: "Editar Perfil",
            style: "editarUsuario.css",
            telefone: telefone,
            user_name: result[0].User_Name,
            nome: result[0].Nome,
            _id: result[0].Id,
            script: "cadastroUsuario.js"
        })
      });
    })
app.post("/userEdit", async(req,res)=>{

    // Array para mensagens de erros
    var erros = []
    let nome
    let username
    let telefone
    let senha
    let userTester

    let email = localStorage.getItem('userEmail')
    console.log(email)
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    //Verificação se a senha e sua confirmação batem
    if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }
    // con.query(userNameConfirm, function (err, resultado) {
    //     if (err) throw err;
    //     userTester = resultado[0].User_Name
    
    // });
    con.query(user, async function (err, result) {
        if (err) throw err;
        console.log(result)
        nome = result[0].Nome
        telefone = result[0].Telefone
        senha = result[0].Senha
        userTester = result[0].User_Name
        username = result[0].User_Name
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            nome = result[0].Nome
        }else{
            nome = req.body.nome
        }
        if(!req.body.username || typeof req.body.username == undefined || req.bodyusername == null){
            username = result[0].User_Name
        }else{
            let testeUser = `SELECT* FROM Usuario_Cliente`
            con.query(testeUser, function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated");
                result.forEach(value => {
                    if(value.User_Name == req.body.username){
                        if(userTester == value.User_Name){
                            username = req.body.username
                        }else{
                            erros.push({texto:"Usuário já existente"})
                        }
                    }else{
                        username = req.body.username
                    }
                });
            });
        }
        if(!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null){
            if(result[0].Telefone == undefined){
                telefone = ''
            }else{
                telefone = result[0].Telefone
            }
        }else{
            telefone = req.body.telefone
        }
        console.log(result[0].Senha)
        if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null || !req.body.confirme_senha || typeof req.body.confirme_senha == undefined || req.body.confirme_senha == null){
            if(result[0].Senha == undefined){
                erros.push({texto:"Erro ao atualizar dados, tente novamente mais tarde"})
            }else{
                senha = result[0].Senha
            }
        }else{
            if(req.body.senha_ant == result[0].Senha){
                if(req.body.senha.length > 32){
                    erros.push({texto:"Senha precisa conter menos de 32 caracteres"})
            
                //Verificação se a variável tem mais de 8 caractere
                }else if(req.body.senha.length < 8){
                    erros.push({texto:"Senha precisa conter, no mínimo, 8 caracteres"})
                }else{
                    senha = req.body.senha
                }
            }else{
                erros.push({texto:"Senha antiga incorreta"})
            }
        }
        if(erros.length == 0){
            if(nome !== undefined){
                let nomeUpdate = `UPDATE Usuario_Cliente SET Nome = '${nome}' WHERE Email='${email}'`
                con.query(nomeUpdate, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
            }
            if(telefone != undefined){
                let telefoneUpdate = `UPDATE Usuario_Cliente SET Telefone = '${telefone}' WHERE Email='${email}'`
                con.query(telefoneUpdate, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
            }
            if(senha != undefined){
                let senhaUpdate = `UPDATE Usuario_Cliente SET Senha = '${senha}' WHERE Email='${email}'`
                con.query(senhaUpdate, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
            }
            if(username !== undefined){
                let userNameUpdate = `UPDATE Usuario_Cliente SET User_Name = '${username}' WHERE Email='${email}'`
                con.query(userNameUpdate, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                });
            }
            if(senha == undefined && telefone == undefined && nome == undefined && username == undefined){
                console.log("Nenhum dado alterado")
            }
            
            res.redirect('/userPerfilImagem')
        }else{
            res.render("user/editarUsuario",{
                title: "Editar Perfil",
                style: "editarUsuario.css",
                erros: erros,
                nome: nome,
                telefone: telefone,
                script: "cadastroUsuario.js"
            })
        }

    });
})

app.get("/logout",(req,res)=>{
    req.session.destroy();
    localStorage.removeItem('userEmail')
    res.redirect("/userSignup")
})
