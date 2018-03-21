/**
 * Created by raquel.ruiz.orozco on 28/02/18.
 */

//Modelo de datos

const Sequelize = require('sequelize'); //Carga el módulo Sequelize
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false}); //Genero una instancia de Sequelize para acceder a una base de datos localizada en el fichero quizzes.sqlite

sequelize.define('quiz', {		//Defino el quiz, que es un modelo de datos
    question: {
        type: Sequelize.STRING,
        unique: {msg: "Ya no existe esta pregunta"}, //Cada pregunta es unica, si se repite me sale ese mensaje
        validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}} //No voy a permitir que se creen preguntas vacias
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
    }
});

sequelize.sync()  //Sincronizar es mirar si en la base de datos tengo las tablas que necesito
    .then(() => sequelize.models.quiz.count())	//Cuenta cuantos quizzes hay en model
.then(count => { //toma como parametro num quiz
    if (!count) { //Si hay cero quizzes
    return sequelize.models.quiz.bulkCreate([   //para crear varias quizzes
        { question: "Capital de Italia", answer: "Roma" },
        { question: "Capital de Francia", answer: "París" },
        { question: "Capital de España", answer: "Madrid" },
        { question: "Capital de Portugal", answer: "Lisboa" }
    ]);
}
})
.catch(error => {
    console.log(error);
});

module.exports = sequelize;

