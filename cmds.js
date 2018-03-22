/**
 * Created by raquel.ruiz.orozco on 28/02/18.
 */
const Sequelize = require('sequelize'); //cargamos modulo sequelize
const { log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');

exports.helpCmd = (socket, rl) => {
    log(socket, "Comandos:");
    log(socket, "h|help - Muestra esta ayuda.");
    log(socket, "show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(socket, "add - Añadir un nuevo quiz interactivamente.");
    log(socket, "delete <id> - Borrar el quiz indicado.");
    log(socket, "edit <id> - Editar el quiz indicado.");
    log(socket, "test <id> - Probar el quiz indicado.");
    log(socket, "p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(socket, "credits - Créditos.");
    log(socket, "q|quit - Salir del programa.");
    rl.prompt();
};

exports.listCmd = ( socket, rl) => {
    /*
    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
    */

    models.quiz.findAll() //te da los quizzes existentes
        .each(quiz => { // Coge todos los quiz que hay dentro del array que devuelve findAll
        log(socket, ` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
})

};

const validateId = id => {
//funcion validacion: voy a querer que me devuelva id
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
        reject(new Error(`Falta el parametro <id>.`));
    } else {
        id = parseInt(id); //coger la parte entera y descartar lo demas
        if (Number.isNaN(id)) {
            reject(new Error(`El valor del parámetro <id> no es un número`))
        } else {
            resolve(id); // Se resuelve la promesa con el id
        }
    }
});
};

exports.showCmd = (socket, rl, id) => {

    validateId(id) // me devuelve una promesa
        //en mi modelo de dato voy quiz y lo busco por id
        .then(id => models.quiz.findById(id))
.then(quiz => {
    //compruebo si realmente me ha pasado un quiz
        if (!quiz) {
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }

    log(socket, ` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
};

const makeQuestion = ( rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
        resolve(answer.trim());
});
});
};

exports.addCmd = (socket, rl) => {

    makeQuestion( rl, 'Introduzca una pregunta: ') //promesa que hasta no introduzca una pregunta no finaliza
        .then(q => {
        return makeQuestion(rl, 'Introduce la respuesta: ')
            .then(a => {
                //creo una pregunta para introducir el texto de la respuesta
            return {question: q, answer: a}; //creo un objeto quiz
});
})
.then(quiz => {
        return models.quiz.create(quiz); //creo objeto en tabla de base de datos
})
.then((quiz) => {
        log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
})
.catch(Sequelize.ValidationError, error => { //error de validacion
        errorlog(socket, 'El quiz es erroneo: ');
    error.errors.forEach(({message}) => errorlog(socket, message));
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
};

exports.deleteCmd = (socket, rl, id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}})) //el elemento que quiero destruir es el que tiene como id el valor id
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
};

exports.editCmd = (socket, rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
.then(quiz => {
        if(!quiz){
        throw new Error(`No existe el parametro asociado ${id}.`);
    }

    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0); //busco la pregunta que tengo que editar por id
    return makeQuestion(rl, ' Introduzca la pregunta: ') //edito pregunta
        .then(q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
    return makeQuestion(rl, 'Introduzca la respuesta ') //edito respuesta
        .then(a => {
        quiz.question =q;
    quiz.answer =a;
    return quiz;
});
});
})
.then(quiz => {
        return quiz.save();
})
.then(quiz => {
        log (socket, `Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
})
.catch(Sequelize.ValidationError, error => { //solo para errores de validacion
        errorlog(socket, 'El quiz es erroneo:');
    error.errors.forEach(({message}) => errorlog(message));
})
.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
}

exports.testCmd = (socket, rl, id) =>
{
    validateId(id)
        .then(id => models.quiz.findById(id)
) //Del modelo de datos voy al modelo quiz y busco un quiz por id
.
    then(quiz => {
        if(
    !quiz
)
    {
        throw new Error(`No existe un quiz asociado al id=${id}.`);
    }


    return makeQuestion( rl, quiz.question)
        .then(answer => {
        if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()
)
    {
        log(socket, "CORRECTO", 'green');
    }

else
    {
        log(socket, "INCORRECTO", 'red');
    }

})
})
.
    catch(
        e => {
        log(socket, "error: " + e);
    rl.prompt();
})
.
    then(() => {
        rl.prompt();
})
    ;
}


exports.playCmd = (socket, rl) => {
    let score = 0;
    let toBePlayed = [];

    const playOne = () => {

        return Promise.resolve()
            .then (() => {
            if ( toBePlayed.length <= 0) {
            log(socket, "No hay nada mas que preguntar. Fin del juego");

            return;
        }
        let pos = Math.floor(Math.random() * toBePlayed.length);
        let quiz = toBePlayed[pos];
        toBePlayed.splice(pos, 1);

        return makeQuestion(rl, quiz.question)
            .then(answer => {
            if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
            score++;
            log(socket, `Respuesta correcta`,'green');
            return playOne();
        } else {
            log(socket, `Respuesta incorrecta`,'red');
            log(socket, 'Fin del juego. ');

        }
    })
    })
    }

    models.quiz.findAll({raw: true})
        .then(quizzes => {
        toBePlayed = quizzes;
})
.then(() => {
        return playOne();
})
.catch(e => {
        log(socket, "error: " + e);
})
.then(() => {
        log(socket, `Tu puntuación es: ${score}`);
    rl.prompt();
})
};


exports.creditsCmd = (socket, rl) => {
    log(socket, 'Autores de la práctica.');
    log(socket, 'Raquel Ruiz Orozco','green');
    log(socket, 'Nombre 2','green');
    rl.prompt();
};

exports.quitCmd = (socket,rl) => {
    rl.close();
    //socket.end();
};