create table student_db.students
(
    id       int auto_increment
        primary key,
    group    varchar(50)                  not null,
    name     varchar(100)                 not null,
    gender   varchar(10)                  not null,
    birthday date                         not null,
    status   varchar(50) default 'Active' null
);

