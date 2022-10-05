const mysql = require("mysql");
const express = require('express');
const app = express()
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const port = 3000;
const route = require("./routes/route") 
const session = require('express-session')
const flash = require('connect-flash')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const passport = require('passport')
require("./config/auth")(passport)
const multer = require('multer');
require('dotenv/config');
const localStorage = require('localStorage');
const cookieParser = require("cookie-parser");
const oneDay = 1000 * 60 * 60 * 24
const sessionStorage = require('sessionstorage-for-nodejs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const cors = require('cors');
const { search } = require("./routes/route");

app.use("/",route)

app.engine('handlebars',engine());
app.set('view engine', 'handlebars');

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

app.use(cors())

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
    res.locals.warning_msg = req.flash("warning_mgs")
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

app.post("/userSignup", async (req,res)=>{

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
        erros.push({texto:"Senha precisa conter 8 caracteres no mínimo"})
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
        var username = `SELECT* FROM Usuario_Cliente WHERE User_Name='${req.body.username}'`
        con.query(email, async function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            if(result.length > 0){
                
                erros.push({texto:"Email já cadastrado"})
                con.query(username, async function (err, resultado, fields) {
                    if(resultado.length > 0){
                        erros.push({texto:"Nome de usuário já cadastrado"})
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros,
                            nome_erro: req.body.nome,
                            telefone_erro: req.body.telefone,
                            script: "userSignup.js"
                        })
                    }else{
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros,
                            nome_erro: req.body.nome,
                            telefone_erro: req.body.telefone,
                            username_erro: req.body.username,
                            script: "userSignup.js"
                        })
                    }
                })      
            }else{
                con.query(username, async function (err, resultado, fields) {
                    if(resultado.length > 0){
                        erros.push({texto:"Nome de usuário já cadastrado"})
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros,
                            nome_erro: req.body.nome,
                            telefone_erro: req.body.telefone,
                            email_erro: req.body.email,
                            script: "userSignup.js"
                        })
                    }else{
                        const salt =await bcrypt.genSaltSync(10)
                        const senha = await req.body.senha
                        let senhaFinal = bcrypt.hashSync(senha, salt)
                        var sql = `INSERT INTO Usuario_Cliente (Nome, User_Name,Email,Telefone,Foto_Perfil,Senha) VALUES ('${req.body.nome}','${req.body.username}','${req.body.email}','${req.body.telefone}','/imgNative/profile.jpg','${senhaFinal}')`;
                        localStorage.setItem('userEmail',req.body.email)
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("Usuário adicionado com sucesso");
                        });
                        req.flash("success_mgs","Usuário Cadastrado com sucesso, recarrege a página para esta mensagem desparecer")
                        res.redirect("/userPerfil")
                    }
                })
            }
        });    
    }else{
        res.render("user/cadastroUsuario",{
            title: "Cadastro",
            style: "cadastrousuario.css",
            erros: erros,
            script: "userSignup.js",
            nome_erro: req.body.nome,
            telefone_erro: req.body.telefone,
            username_erro: req.body.username,
            email_erro: req.body.email
        })
    }
})

// //Tentativa de dar um upload em imagens no banco de dados
app.post("/upload/:id", upload.single('foto'), async(req,res,result)=>{
    var id = req.params.id
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]+/;

    if(format.test(req.file.originalname)){

        await unlinkAsync(`public/img/${req.file.originalname}`)
        req.flash("error_mgs","Imagem fora do padrão permitido, ela não deve conter caracteres especiais e espaços, recarrege a página para esta mensagem desparecer")
        console.log("Imagem fora do padrão permitido")
        res.redirect("/userPerfil")
  
    } else {
        var user = `UPDATE Usuario_Cliente SET Foto_Perfil= '/img/${req.file.originalname}' WHERE Id='${id}'`
        con.query(user, function (err, result) {
            if (err) throw err;
            if(result.length = 0){
            req.flash("error_mgs","Erro ao atualizar foto de perfil, recarrege a página para esta mensagem desparecer")
            console.log("Erro ao salvar imagem")
            res.redirect("/userPerfil")
            }else{
                req.flash("success_mgs","Foto de perfil atualizada, recarrege a página para esta mensagem desparecer")
                console.log("Imagem salva com sucesso")
                res.redirect("/userPerfil")
            }
      });
        
    }
})

app.get("/userPerfil", async (req,res)=>{
    let erros = []
    let email = localStorage.getItem('userEmail')
    if(email != null){
    let user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    con.query(user, function (err, result) {
        if (err) throw err;
        res.render("user/areaDoUsuario",{
            title: result[0].User_Name,
            style: "areaDoUsuario.css",
            email: email,
            usuario: result[0].User_Name,
            _id: result[0].Id,
            fotoPerfil:  result[0].Foto_Perfil,
            script: 'userPerfil.js'
        })
    })
    }else{
        erros.push({texto:"Erro insperado, entre novamente mais tarde"})
        res.render("user/loginUsuario",{
            title: "Entrar",
            style: "loginUsuario.css",
            erros: erros,
            script: 'userLogin.js'
        })
    }
})

// //Rota de autentificação do login
app.post("/userLogin", async(req,res,next)=>{
    var erros = []
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.email}'`
    con.query(user, async function (err, result, fields) {
        if(result.length > 0){
            localStorage.setItem('userEmail',req.body.email)
            let senha = await bcrypt.compare(req.body.senha, result[0].Senha)
            if(senha){
                res.redirect('/userPerfil')
            }else{
                erros.push({texto:"Senha incorreta"})
                res.render("user/loginUsuario",{
                    title: "Entrar",
                    style: "loginUsuario.css",
                    erros: erros,
                    emailErro: result[0].Email,
                    script: 'userLogin.js'
                })
            }
        }else{
            erros.push({texto:"Essa conta não existe"})
            res.render("user/loginUsuario",{
                title: "Entrar",
                style: "loginUsuario.css",
                erros: erros,
                script: 'userLogin.js'
        })
    }
});
})
    

app.get("/userEdit", async(req,res)=>{

    let email = localStorage.getItem('userEmail')
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    if(email){
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
                script: "userEdit.js"
            })
          });
    }else{
        res.redirect('/userSignup')//Mudar para index depois
    }
})
app.post("/userEdit", async(req,res)=>{

    // Array para mensagens de erros
    var erros = []
    let nome
    let username
    let telefone
    let senha
    let userTester = []

    if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }

    let email = localStorage.getItem('userEmail')
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    let testeUser = `SELECT* FROM Usuario_Cliente`
            con.query(testeUser, function (err, result) {
                if (err) throw err;
                console.log('teste')
                result.forEach(value => {
                 userTester.push(value.User_Name)

            });
            con.query(user, async function (err, result) {
                if (err) throw err;
                if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
                    nome = undefined
                }else{
                    if(result[0].Nome == req.body.nome){
                        nome = undefined
                    }else{
                        nome = req.body.nome
                    }
                }
                if(!req.body.username || typeof req.body.username == undefined || req.body.username == null){
                    username = undefined
                }else{
                    console.log(userTester)
                    userTester.forEach((value)=>{
                        //console.log("entrou foreach")
                        console.log(value)
                        if(value == req.body.username){
                            if(result[0].User_Name == req.body.username){
                                username = undefined
                            }else{
                                erros.push({texto:"Usuário já existente"})
                                console.log("erro")
                            }
                        }else{
                            if(result[0].User_Name == req.body.username){
                                username = undefined
                            }else{
                                username = req.body.username
                            }
                        }
                    })
                }
                if(!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null){
                    if(result[0].Telefone == undefined){
                        telefone = undefined
                    }else{
                        telefone = undefined
                    }
                }else{
                    if(result[0].Telefone == req.body.telefone){
                        telefone = undefined
                    }else{
                        telefone = req.body.telefone
                    }
                }
                if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null || !req.body.confirme_senha || typeof req.body.confirme_senha == undefined || req.body.confirme_senha == null){
                    if(result[0].Senha == undefined){
                        erros.push({texto:"Erro ao atualizar dados, tente novamente mais tarde"})
                    }else{
                        senha = undefined
                    }
                }else{
                    let senhaConferir = await bcrypt.compare(req.body.senha_ant, result[0].Senha)
                    if(senhaConferir){
                        if(req.body.senha.length > 32){
                            erros.push({texto:"Senha precisa conter menos de 32 caracteres"})
                    
                        //Verificação se a variável tem mais de 8 caractere
                        }else if(req.body.senha.length < 8){
                            erros.push({texto:"Senha precisa conter 8 caracteres no mínimo"})
                        }else{
                            const salt =await bcrypt.genSaltSync(10)
                            const senhaHash = await req.body.senha
                            senha = bcrypt.hashSync(senhaHash, salt)
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
                            console.log(result.affectedRows + " Nome updated ");
                        });
                    }
                    if(telefone != undefined){
                        let telefoneUpdate = `UPDATE Usuario_Cliente SET Telefone = '${telefone}' WHERE Email='${email}'`
                        con.query(telefoneUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " Telefone updated");
                        });
                    }
                    if(senha != undefined){
                        let senhaUpdate = `UPDATE Usuario_Cliente SET Senha = '${senha}' WHERE Email='${email}'`
                        con.query(senhaUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " Senha updated");
                        });
                    }
                    if(username !== undefined){
                        let userNameUpdate = `UPDATE Usuario_Cliente SET User_Name = '${username}' WHERE Email='${email}'`
                        con.query(userNameUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " User_Name updated");
                        });
                    }
                    if(senha == undefined && telefone == undefined && nome == undefined && username == undefined){
                        console.log("Nenhum dado alterado")
                        req.flash("warning_mgs","Nenhum dado alterado, recarrege essa página para essa mensagem despararecer")
                    }
                    if(senha != undefined || telefone != undefined || nome != undefined || username != undefined){
                        console.log("Dados alterados")
                        req.flash("success_mgs","Dados alterados com sucesso, recarrege essa página para essa mensagem despararecer")
                    }
                    
                    res.redirect('/userPerfil')
                }else{
                    res.render("user/editarUsuario",{
                        title: "Editar Perfil",
                        style: "editarUsuario.css",
                        erros: erros,
                        nome: req.body.nome,
                        user_name: req.body.username,
                        telefone: req.body.telefone,
                        script: "userEdit.js"
                    })
                }
        
            });
        })
    
})

app.get("/logout",(req,res)=>{
    req.session.destroy();
    localStorage.removeItem('userEmail')
    res.redirect("/userLogin")//Mudar para index depois
})

app.get('/search', function(req, res) {
    res.render("search/search",{
        style: "search.css",
        title: "Pesquisar",
        script: 'search.js'
    })
    // con.query('SELECT User_name FROM Usuario_Cliente WHERE User_Name LIKE "%' + req.body.nome + '%"',
    // function(err, rows, fields) {
    // if (err) throw err;
    // var data = [];
    // for (i = 0; i < rows.length; i++) {
    // data.push({username: rows.User_Name});
    // }
    //         console.log(data)
    //         res.render("search/search",{
    //             data: data
    //         })
    //     });
    });

app.post('/business/Signup',(req,res)=>{
    res.render("business/perfilEmpresa",{
        title: "Entrar",
        style: "perfilBusiness.css",
        script: "businessPerfil.js"
    })
})
