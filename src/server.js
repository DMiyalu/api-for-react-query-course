import express from 'express';
import knex from 'knex';
import path from 'path';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Configuration de la base de données
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, './kda_db.sqlite'),
  },
});

app.get('/', (req, res) => res.redirect('/api/students'));

app.get('/api/students', async ({ query }, res) => {
  const searchTerm = query.search_term;
  let students = null;
  if (searchTerm) {
    students = await db
      .select()
      .from('students')
      .where('fname', 'like', `%${searchTerm}%`)
      .orWhere('lname', 'like', `%${searchTerm}%`)
      .orWhere('citizenship', 'like', `%${searchTerm}%`)
      .orWhere('position', 'like', `%${searchTerm}%`)
      .orWhere('promo', 'like', `%${searchTerm}%`);
  } else {
    students = await db.select().from('students');
  }
  if (!students) return res.json('Aucun resultat').status(404);
  const formattedStudentist = students.map(
    ({
      id,
      lname,
      fname,
      citizenship,
      position,
      salary,
      year_of_study,
      promo,
      sexe,
    }) => ({
      id,
      sexe,
      nom: lname,
      prenom: fname,
      nationalite: citizenship,
      poste: position,
      salaire: salary,
      annee: year_of_study,
      promotion: promo,
    })
  );
  return res.send(formattedStudentist);
});

const port = process.env.PORT || 3001;

app.listen(port, () =>
  console.log(`L'API est disponible sur l'url http://localhost:${port}`)
);
