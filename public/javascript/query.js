const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database:'cookwe',
    port:'5434'
});

function realizarConsulta(callback) {
  const consulta = 'SELECT * FROM recipe';

  pool.query(consulta, (error, resultado) => {
    if (error) {
      console.error('Error al ejecutar la consulta', error);
      callback(error, null);
    } else {
      callback(null, resultado.rows);
    }
  });
}

function realizarConsulta2(callback,name) {
  const consulta = 'SELECT * FROM recipe r'
                  +'inner join recipe_ingredients ri on r.id = ri.idrecipe'
                  +'inner join ingredients i on i.id = ri.idingredients'
                  +`where i.name = ${name}`;

  pool.query(consulta, (error, resultado) => {
    if (error) {
      console.error('Error al ejecutar la consulta', error);
      callback(error, null);
    } else {
      callback(null, resultado.rows);
    }
  });
}
/*
function realizarBusqueda(callback,ingredients,categories,subcategories) {
  const consulta = 'SELECT * FROM recipe r'
                  +'inner join recipe_ingredients ri on r.id = ri.idrecipe'
                  +'inner join ingredients i on i.id = ri.idingredients'
                  +'inner join categories c on c.id = r.idcategories'
                  +'inner join subcategories s on s.id = r.idsubcategories'
                  +`where i.name = ${ingredients} and c.name = ${categories} and s.name = ${subcategories}`;

  pool.query(consulta, (error, resultado) => {
    if (error) {
      console.error('Error al ejecutar la consulta', error);
      callback(error, null);
    } else {
      callback(null, resultado.rows);
    }
  });
}
*/
/*
function realizarBusqueda(callback,ingredients,categories,subcategories) {
  const consulta = 'SELECT * FROM recipe_ingredients ri'
                  +'inner join recipe r on r.id = ri.idrecipe'
                  +'inner join ingredients i on i.id = ri.idingredients'
                  +'inner join categories c on c.id = r.idcategories'
                  +'inner join subcategories s on s.id = r.idsubcategories'
                  +`where i.name = ${ingredients} and c.name = ${categories} and s.name = ${subcategories}`;

  pool.query(consulta, (error, resultado) => {
    if (error) {
      console.error('Error al ejecutar la consulta', error);
      callback(error, null);
    } else {
      callback(null, resultado.rows);
    }
  });
}
*/
module.exports = {
  realizarConsulta,
};
