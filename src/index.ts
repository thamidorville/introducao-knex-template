import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//PRATICA GUIADA 1
//Para garantir que está tudo certo
//crie um endpoint que busca pelas bandas na tabela bands 
//utilizando queries no formato raw

app.get("/bands", async (req: Request, res: Response) => {
    try {
        const result = await db.raw(`
        SELECT * FROM bands;
        `)

        res.status(200).send(result)



    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//PRÁTICA 2
//Crie um endpoint que cria uma nova banda

app.post('/bands', async (req:Request, res: Response) => {
try {
    
    const id = req.body.id
    const name = req.body.name
    
    //validar os dados de entrada
    if(typeof id !== "string"){
        res.status(400)
        throw new Error ("id deve ser uma string")
    }
    if(typeof name !== "string"){
        res.status(400)
        throw new Error ("name deve ser uma string")
    }
    if(id.length <= 0){
        res.status(400)
        throw new Error("id não deve estar vazio")
    }
    // se passou pela validação posso inserir o dado com queries raw

   await db.raw(`
        INSERT INTO bands(id, name)
        VALUES ("${id}", "${name}");
    `)
    res.status(201).send("Banda inserida com sucesso!")

} catch (error) {
  
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }    
}
)

//PRÁTICA 3 - ATUALIZANDO DADOS
//Implemente o endpoint de edição de bandas na tabela

app.put('/bands/:id', async (req: Request, res: Response) => {
    try {
        
        const id = req.params.id

        const newId = req.body.id
        const newName = req.body.name
       
        //verificação de negócio
        if (newId !== undefined) {

            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }

				if (newId.length < 1) {
                res.status(400)
                throw new Error("'id' deve possuir no mínimo 1 caractere")
            }
        }

        if (newName !== undefined) {

            if (typeof newName !== "string") {
                res.status(400)
                throw new Error("'name' deve ser string")
            }

            if (newName.length < 2) {
                res.status(400)
                throw new Error("'name' deve possuir no mínimo 2 caracteres")
            }
        }

        
				// verificamos se o user a ser editado realmente existe
        const [ band ] = await db.raw(`
					SELECT * FROM bands
					WHERE id = "${id}";
				`) // desestruturamos para encontrar o primeiro item do array

				// se existir, aí sim podemos editá-lo
        if (band) {
						await db.raw(`
							UPDATE bands
							SET
								id = "${newId || band.id}",
								name = "${newName || band.name}"
								
							WHERE
								id = "${id}";
						`)

        } else {
            res.status(404)
            throw new Error("'id' não encontrada")
        }

        res.status(200).send({ message: "Atualização realizada com sucesso" })



    } catch (error) {
         console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
