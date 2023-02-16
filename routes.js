const {Pool} = require('pg');
const { json } = require('express');
const fetch = require('node-fetch');
const express = require ('express');
const fs = require('fs');


 

const port = 3000;

const app = express();



const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'admin',
    database:'cookwe',
    port:'5434'
}

const pool = new Pool(config);

const getBooks = async () =>{
   const res = await pool.query('select * from ingredients')
    console.log(res.rows);
}


const insertUser = async ()=>{

    let rawdata = fs.readFileSync('./areas.json');
    let data = JSON.parse(rawdata);
    // console.log(data['comidas'][0]);
    for (let i = 0; i < 1; i++) {

        const text ='insert into recipe (id, name, instructions) values ($1, $2,  $3)'
        const values =[ data['comidas'][i]['idMeal'], data['comidas'][i]['strMeal'],data['comidas'][i]['strInstrucciones']];
        
        const res = await pool.query(text,values)
        console.log(res);
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