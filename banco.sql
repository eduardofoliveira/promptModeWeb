create table dominios(
  id bigint not null primary key auto_increment,
  dominios varchar(100) not null
);

create table programacoes(
  id bigint not null primary key auto_increment,
  fk_id_dominio bigint not null,
  did varchar(20) not null,
  destino varchar(50) not null,
  dia_semana int not null,
  hora int not null,
  minuto int not null,
  minuto int not null,
  foreign key (fk_id_dominio) references dominios(id)
);

create table feriados(
  id bigint not null primary key auto_increment,
  fk_id_dominio bigint not null,
  did varchar(20) not null,
  destino varchar(50) not null,
  destino_pos varchar(50) not null,
  inicio timestamp default 0,
  fim timestamp default 0,
  foreign key (fk_id_dominio) references dominios(id)
);

create table config(
  id bigint not null primary key auto_increment,
  chave varchar(50) not null,
  valor varchar(50) not null
);

create table log(
  id bigint not null primary key auto_increment,
  informacao varchar(4096) not null,
  horario timestamp not null default current_timestamp
);

insert into config (chave, valor) values ("url_webservice", "http://52.15.232.149:9000/basixws");
insert into config (chave, valor) values ("email_notificacao", "suporte.basix@cloudcom.com.br");