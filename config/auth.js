const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

require("../models/User")
const User_Cliente = mongoose.model("Usuario_Cliente")

module.exports = (passport)=>{
    passport.use(new localStrategy({usernameField: 'email',passwordField: 'senha'}, (senha, email, done)=>{

        console.log("Entrou")
        User_Cliente.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                console.log("erro")
                return done(null,false,{message: "Essa conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem)=>{

                if(batem){
                    console.log("Senha bate,")
                    return done(null,usuario)
                }else{
                    console.log("Senha incorreta")
                    return done(null,false,{message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done)=>{

        done(null, usuario.id)
        console.log("teste")
    })

    passport.deserializeUser((id, done)=>{
        User_Cliente.findById(id,(err, usuario)=>{
            done(err,usuario)
            console.log("teste")
        })
    })
}