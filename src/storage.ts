import { MysqlError, Pool } from 'mysql';

import { Article } from './article.model';
import { sendEmail } from './notifications';


function query(query: string, inputs: any[], callback: (error: MysqlError, result: any[]) => void, pool: Pool) {
    pool.getConnection(function(error, connection) {
        connection.beginTransaction(function(error) {
            if (error) {                  
                // Transaction Error (Rollback and release connection)
                connection.rollback(function() {
                    connection.release();
                    callback(error, []);
                });
            } else {
                connection.query(query, inputs, function(error, results) {
                    if (error) {          
                        // Query Error (Rollback and release connection)
                        connection.rollback(function() {
                            connection.release();
                            callback(error, []);
                        });
                    } else {
                        connection.commit(function(error) {
                            if (error) {
                                connection.rollback(function() {
                                    connection.release();
                                    callback(error, []);
                                });
                            } else {
                                connection.release();
                                callback(error, results);
                            }
                        });
                    }
                });
            }    
        });
    });
}

/**
 * @param article Article that will be stored
 * @param pool Connectin pool
 * @description Will only store an article if the uniqueKey is unique in the database.
 */
export function storeArticle(article: Article, pool: Pool) {
    query('SELECT * FROM articles WHERE uID = ?', [article.uniqueKey], (err, result) => {
        if(err || !result.length) {
            // Article does not exist
            console.log(`Found new article: "${article.title.length > 50 ? article.title.substr(0, 50) + '...' : article.title}"`);
            query('INSERT INTO `mainpost`.`articles` (`uID`, `title`, `date`, `description`, `tel`, `chiffre`) VALUES (?, ?, ?, ?, ?, ?);',
            [article.uniqueKey, article.title, article.date, article.description, article.tel, article.chiffre], err => {
                if(err) { throw err } else { 
                    if(article.isAboutCarport) {
                        sendEmail(article); 
                    }
                }
            }, pool)
        }
    }, pool);
}