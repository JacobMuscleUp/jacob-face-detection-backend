import * as Knex from 'knex';
import * as bcrypt from 'bcrypt';

/**
*   User Service
*   Database queries 
*   Tables : users | logins
*/

class UserService {
    constructor(private db: Knex) {
        this.db = db;
    }

    private saltRounds = 10;

    findUsersById = (id: string) => {
        return this.db('users')
            .select('*')
            .where('id', '=', id);
    }

    onUserSignUp = (name: string, email: string, password: string) => {
        return this.db.transaction(async (trx) => {
            try {
                const hash = await bcrypt.hash(password, this.saltRounds);
                const users = await trx.insert({
                    name: name,
                    email: email
                })
                    .into('users')
                    .returning('*');
                const login = await trx('logins').insert({
                    hash: hash,
                    user_id: users[0].id
                });
                return users[0];
            }
            catch (err) {
                return err;
            }
        })
            .catch((err) => {
                return err;
            });
    }

    onUserSignIn = async (email: string, password: string) => {
        try {
            const idHashTuples = await this.db('users').join('logins', 'users.id', '=', 'logins.user_id')
                .select('users.id', 'logins.hash')
                .where('users.email', '=', email);
            const pwIsValid = await bcrypt.compare(password, idHashTuples[0].hash);
            if (pwIsValid) {
                try {
                    const users = await this.findUsersById(idHashTuples[0].id);
                    return users[0];
                }
                catch (err) {
                    return err;
                }
            } else {
                return new Error('Failed to sign in, please provide a valid email or password');
            }
        }
        catch (err) {
            return err;
        }
    }

    incrementUserEntries = async (id: number) => {
        try {
            const entries = await this.db('users')
                .where('id', '=', id)
                .increment('entries', 1)
                .returning('entries');
            if (entries.length) {
                return entries[0];
            } else {
                return new Error('User not found');
            }
        }
        catch (err) {
            return new Error('Encounter an err when getting an entries')
        }
    }
}

export default UserService;