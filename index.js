//Dependecias/librerias necesarias para correr el proyecto: 
// pg: permite conectarnos a Postgres
// node-fetch: permite conectarnos a una api
// express: permite crear un localhost
//fs: permite leer archivos JSON
const {Pool} = require('pg');
const { json } = require('express');
const fetch = require('node-fetch');
const express = require ('express');
const fs = require('fs');


 

const port = 3000;

const app = express();


//Credenciales de la BD
const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database:'cookwe',
    port:'5434'
}

const pool = new Pool(config);

//Metodo para consultar a la base de datos
const getBooks = async () =>{
    
    
    const res = await pool.query('select * from ingredients')
    
    console.log(res);
    
}
getBooks();
//Metodo para insertar a la base de datos
const insertUser = async ()=>{
    let rawdata = fs.readFileSync('./recetas.json');
    let data = JSON.parse(rawdata);
    
    for(let i = 0; i < 20; i++){
        const res1 = await pool.query('select id from ingredients where name = \''+ data['comidas'][0]['strIngredient'][(i+1)] +'\' ')
        if(res1 != null){
        
        const id = parseInt(data['comidas'][0]['idMeal']);
        const text ='insert into recipe_ingredients (id, idrecipe, idingredients, amount) values ($1, $2, $3, $4)';
        const values =[(788+(i+1)),id,res1.rows[0]['id'],data['comidas'][0]['strMeasure'][i+1] ];
        const res = await pool.query(text,values)
        console.log(res);
        }
    }
    
    pool.end();

    /*
        fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list').then((res)=>{
    return res.json();
    }).then(async (json)=>{
        for (let i = 0; i < 574; i++) {
            const text ='insert into ingredients (id, name, type, description) values ($1, $2, $3, $4)'
            const values =[ json['comidas'][i]['idIngredient'], json['comidas'][i]['strIngredient'], json['comidas'][i]['strType'], json['comidas'][i]['strDescription']];
            
            const res = await pool.query(text,values)
            console.log(res);
        }
        
        pool.end();
    })
    */
    

    
   
    /*const text ='insert into ingredients (id, name, type, description) values ($1 , $2, $3, $4)'
    const values =[data['comidas'][1]['idIngredient'],data['comidas'][1]['srtIngredient'],data['comidas'][1]['srtType'],d['comidas'][1]['srtDescription']];
    const res = await pool.query(text,values)
    console.log(res);
    pool.end();*/
}
insertUser();
