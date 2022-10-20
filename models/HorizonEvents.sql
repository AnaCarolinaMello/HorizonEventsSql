
CREATE DATABASE HorizonEvents;
USE HorizonEvents;

CREATE TABLE Usuario_Cliente(
Id int unsigned auto_increment not null,
Nome varchar(80) not null,
User_Name varchar(80) not null,
Email varchar(80) not null,
Telefone char(15),
Foto_Perfil  varchar(80),
Senha varchar(90) not null,
Primary key(Id)
)Engine=INNODB;

CREATE TABLE Empresa(
Id int unsigned auto_increment not null,
CNPJ char(18) not null,
Razao_Comercial varchar(100) not null,
Nome_Fantasia varchar(90) not null,
Descricao varchar(255),
Website varchar(100),
Foto_Perfil varchar(80),
Imagem_Demostrativa1 varchar(80),
Imagem_Demostrativa2 varchar(80),
Imagem_Demostrativa3 varchar(80),
Representante varchar(80) not null,
Telefone char(15),
Numero varchar(80) not null,
Rua varchar(80) not null,
Bairro varchar(80),
Cidade varchar(80),
UF char(2),
CEP char(9) not null,
Senha varchar(100) not null,
primary key(Id)
)Engine=INNODB;

CREATE TABLE Favoritos(
Id int unsigned auto_increment not null,
Usuario_Id int unsigned not null,
Empresa_Id int unsigned not null,
primary key(id),
foreign key(Usuario_Id) references Usuario_Cliente(Id),
foreign key(Empresa_Id) references Empresa(Id)
)Engine=INNODB;
